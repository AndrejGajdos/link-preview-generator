export = link_preview_generator;

declare function link_preview_generator(
    uri: string,
    puppeteerArgs?: string[],
    puppeteerAgent?: string,
    executablePath?: string
): Promise<LinkPreviewResult>;

declare interface LinkPreviewResult {
    title: string;
    description: string;
    domain: string;
    img: string;
}
