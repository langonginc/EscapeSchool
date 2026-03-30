export interface Dialog {
    type: 'text' | 'option';
    text: string;
    options?: DialogOption[];
}

export interface DialogOption {
    text: string;
    next: Dialog[];
}

export interface DialogJson {
    dialogs: Dialog[];
    version: number;
}
