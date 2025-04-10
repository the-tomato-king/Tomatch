export class MediaService {
  async uploadImage(
    userId: string,
    image: string,
    path: string
  ): Promise<string>;
  async analyzeReceiptImage(imageData: string): Promise<ReceiptAnalysisResult>;
}
