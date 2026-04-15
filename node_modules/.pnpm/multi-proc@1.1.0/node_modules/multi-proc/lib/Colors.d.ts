export declare const color: (text: string, ...colors: Color[]) => string;
export declare enum Color {
    RESET = "\u001B[0m",
    BOLD = "\u001B[1m",
    DIM = "\u001B[2m",
    UNDERLINE = "\u001B[4m",
    BLINK = "\u001B[5m",
    REVERSE = "\u001B[7m",
    HIDDEN = "\u001B[8m",
    BLACK = "\u001B[30m",
    RED = "\u001B[31m",
    GREEN = "\u001B[32m",
    YELLOW = "\u001B[33m",
    BLUE = "\u001B[34m",
    MAGENTA = "\u001B[35m",
    CYAN = "\u001B[36m",
    WHITE = "\u001B[37m",
    BG_RED = "\u001B[41m",
    BG_GREEN = "\u001B[42m",
    BG_YELLOW = "\u001B[43m",
    BG_BLUE = "\u001B[44m",
    BG_MAGENTA = "\u001B[45m",
    BG_CYAN = "\u001B[46m"
}
