import { SiteSettingsRepository } from "../repositories/site-settings.repository";
import { HomepageVideoSchema, HomepageVideoInput } from "../schemas/homepage-video.schema";

export class UpdateHomepageVideoUseCase {
  private repository: SiteSettingsRepository;

  constructor() {
    this.repository = new SiteSettingsRepository();
  }

  async execute(input: HomepageVideoInput) {
    const validated = HomepageVideoSchema.parse(input);
    
    await Promise.all([
      this.repository.upsert("homepage_youtube_url", validated.youtubeUrl || "", "URL Media Showcase Beranda"),
      this.repository.upsert("showcase_tagline", validated.tagline || "", "Tagline Showcase Beranda"),
      this.repository.upsert("showcase_title", validated.title || "", "Judul Utama Showcase Beranda"),
      this.repository.upsert("showcase_description1", validated.description1 || "", "Deskripsi Paragraf 1 Showcase"),
      this.repository.upsert("showcase_description2", validated.description2 || "", "Deskripsi Paragraf 2 Showcase"),
      this.repository.upsert("showcase_aspect_ratio", validated.aspectRatio || "PORTRAIT", "Rasio Aspek Media Showcase"),
    ]);

    return { success: true };
  }
}
