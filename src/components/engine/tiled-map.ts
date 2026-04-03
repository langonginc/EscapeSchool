// engine/TileMap.ts

export interface TmxObject {
    id: number;
    name: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    // 如果你在 Tiled 里加了自定义属性，可以在这里扩展，比如 properties: Record<string, any>
}

interface TilesetInfo {
    firstGid: number;
    image: HTMLImageElement;
}

export class TileMap {
    public width: number = 0;
    public height: number = 0;
    public tilewidth: number = 0;
    public tileheight: number = 0;
    
    private tilesets: TilesetInfo[] = [];
    
    private layers: Map<string, number[]> = new Map();
    public walls: Array<{x: number, y: number, w: number, h: number}> = [];
    public objects: TmxObject[] = [];

    private isLoaded: boolean = false;

    // 构造函数变干净了，什么都不用传
    constructor() {}

    public async loadTmx(tmxUrl: string): Promise<void> {
        try {
            const response = await fetch(tmxUrl);
            if (!response.ok) throw new Error(`无法加载 TMX: ${tmxUrl}`);
            const xmlText = await response.text();

            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "text/xml");

            // 1. 解析基础属性
            const mapElement = xmlDoc.querySelector('map');
            if (!mapElement) throw new Error("无效的 TMX 文件");
            this.width = parseInt(mapElement.getAttribute('width') || '0');
            this.height = parseInt(mapElement.getAttribute('height') || '0');
            this.tilewidth = parseInt(mapElement.getAttribute('tilewidth') || '0');
            this.tileheight = parseInt(mapElement.getAttribute('tileheight') || '0');

            // 2. 解析图集
            const tilesetElements = xmlDoc.querySelectorAll('tileset');
            const loadPromises: Promise<void>[] = []; // 存放所有图片加载的 Promise

            tilesetElements.forEach(tsEl => {
                const firstGid = parseInt(tsEl.getAttribute('firstgid') || '1');
                const imageElement = tsEl.querySelector('image');
                
                if (imageElement) {
                    const source = imageElement.getAttribute('source');
                    if (source) {
                        const absoluteImageUrl = new URL(source, new URL(tmxUrl, window.location.href)).href;
                        // 把每个图片的加载任务推入数组
                        loadPromises.push(this.loadImage(absoluteImageUrl, firstGid));
                    }
                }
            });

            // 等待所有图集图片都加载完毕！
            await Promise.all(loadPromises);

            // 🌟 极其重要：将图集按 firstGid 从大到小排序
            // 这样我们在渲染时，只要找到第一个 firstGid <= tileId 的图集，就是目标图集！
            this.tilesets.sort((a, b) => b.firstGid - a.firstGid);

            // 3. 🌟 防弹级：解析所有图块层 (Tile Layers)
            const layerElements = xmlDoc.querySelectorAll('layer');
            layerElements.forEach(layerEl => {
                // 转成小写并去掉多余空格，防止手误
                const layerName = (layerEl.getAttribute('name') || 'unnamed').trim().toLowerCase();
                const dataElement = layerEl.querySelector('data');
                
                if (dataElement && dataElement.getAttribute('encoding') === 'csv') {
                    // 核心修复：剔除所有的换行、回车、空格，再用逗号分割
                    const cleanCsv = (dataElement.textContent || '').replace(/\s+/g, '');
                    if (cleanCsv) {
                        const parsedData = cleanCsv.split(',').map(s => parseInt(s, 10));
                        this.layers.set(layerName, parsedData);
                    }
                }
            });

            // 4. 解析所有对象层 (Object Groups)
            const objectGroupElements = xmlDoc.querySelectorAll('objectgroup');
            objectGroupElements.forEach(groupEl => {
                const objectElements = groupEl.querySelectorAll('object');
                objectElements.forEach(objEl => {
                    this.objects.push({
                        id: parseInt(objEl.getAttribute('id') || '0'),
                        name: (objEl.getAttribute('name') || '').trim(),
                        type: (objEl.getAttribute('type') || objEl.getAttribute('class') || '').trim(),
                        x: parseFloat(objEl.getAttribute('x') || '0'),
                        y: parseFloat(objEl.getAttribute('y') || '0'),
                        width: parseFloat(objEl.getAttribute('width') || '0'),
                        height: parseFloat(objEl.getAttribute('height') || '0')
                    });
                });
            });

            // 5. 提取碰撞层
            this.buildCollision();
            this.isLoaded = true;

        } catch (error) {
            console.error("TMX 解析失败:", error);
        }
    }

    /**
     * 🌟 防弹级：构建物理墙壁
     */
    private buildCollision() {
        this.walls = [];

        // 途径 A：从【图块层】中找墙壁 (用笔刷画的格子墙)
        // 刚才我们在解析时已经把名字全转小写了，这里直接找 'wall'
        const wallData = this.layers.get('wall'); 
        if (wallData) {
            let tileWallCount = 0;
            wallData.forEach((tileId, index) => {
                if (tileId !== 0) { 
                    const col = index % this.width;
                    const row = Math.floor(index / this.width);
                    this.walls.push({ 
                        x: col * this.tilewidth, 
                        y: row * this.tileheight, 
                        w: this.tilewidth, 
                        h: this.tileheight 
                    });
                    tileWallCount++;
                }
            });
            console.log(`[TileMap] 🧱 从图块层找到了 ${tileWallCount} 块墙壁`);
        }

        // 途径 B：从【对象层】中找墙壁 (用矩形工具画的自定义区域)
        // 有些人喜欢画一个大矩形当墙，我们支持查找名字或类型为 wall 的对象
        let objectWallCount = 0;
        this.objects.forEach(obj => {
            if (obj.name.toLowerCase() === 'wall' || obj.type.toLowerCase() === 'wall') {
                this.walls.push({ 
                    x: obj.x, 
                    y: obj.y, 
                    // Tiled 里有的点对象没有宽高，默认给个格子大小防报错
                    w: obj.width || this.tilewidth, 
                    h: obj.height || this.tileheight 
                });
                objectWallCount++;
            }
        });
        if (objectWallCount > 0) {
            console.log(`[TileMap] 📦 从对象层找到了 ${objectWallCount} 块墙壁区域`);
        }

        if (this.walls.length === 0) {
            console.warn("[TileMap] ⚠️ 警告：地图加载完毕，但没有提取到任何墙壁！请检查 Tiled 里是否有叫 'wall' 的图层或对象。");
        }
    }

    public getObjectByName(name: string): TmxObject | undefined {
        return this.objects.find(obj => obj.name === name);
    }

    // 封装一个 Promise 版的图片加载器，确保图片加载完游戏才开始
    private loadImage(url: string, firstGid: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.tilesets.push({ firstGid, image: img });
                resolve();
            };
            img.onerror = () => reject(new Error(`无法加载图集图片: ${url}`));
            img.src = url;
        });
    }

    public checkCollision(x: number, y: number, w: number, h: number): boolean {
        if (!this.isLoaded) return false;
        for (const wall of this.walls) {
            if (x < wall.x + wall.w && x + w > wall.x && y < wall.y + wall.h && y + h > wall.y) {
                return true; 
            }
        }
        return false;
    }

    render(ctx: CanvasRenderingContext2D) {
        if (!this.isLoaded || this.tilesets.length === 0) return;

        this.layers.forEach((dataArray, layerName) => {
            dataArray.forEach((tileId, index) => {
                if (tileId === 0) return;

                // 🌟 核心：在排序好的图集数组中，找到正确的那一张图！
                // 因为数组是按 firstGid 降序排的，找到的第一个满足条件的绝对是准确的图集
                const targetTileset = this.tilesets.find(ts => tileId >= ts.firstGid);
                if (!targetTileset) return; // 如果找不到（可能是坏数据），跳过

                const col = index % this.width;
                const row = Math.floor(index / this.width);
                
                // 使用找到的目标图集的 firstGid 进行偏移计算
                const localTileId = tileId - targetTileset.firstGid;
                const tilesetCols = Math.floor(targetTileset.image.width / this.tilewidth);

                const sx = (localTileId % tilesetCols) * this.tilewidth;
                const sy = Math.floor(localTileId / tilesetCols) * this.tileheight;

                ctx.drawImage(
                    targetTileset.image, 
                    sx, sy, this.tilewidth, this.tileheight, 
                    col * this.tilewidth, row * this.tileheight, this.tilewidth, this.tileheight
                );
            });
        });
    }
}