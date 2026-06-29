import { SiteSettingsRepository } from "../repositories/site-settings.repository";

export class GetHomepageVideoUseCase {
  private repository: SiteSettingsRepository;

  constructor() {
    this.repository = new SiteSettingsRepository();
  }

  async execute() {
    const [urlSetting, taglineSetting, titleSetting, desc1Setting, desc2Setting, aspectSetting] = await Promise.all([
      this.repository.getByKey("homepage_youtube_url"),
      this.repository.getByKey("showcase_tagline"),
      this.repository.getByKey("showcase_title"),
      this.repository.getByKey("showcase_description1"),
      this.repository.getByKey("showcase_description2"),
      this.repository.getByKey("showcase_aspect_ratio"),
    ]);

    const validAspects = ["PORTRAIT", "LANDSCAPE", "SQUARE"];
    const aspectRatio = validAspects.includes(aspectSetting?.value || "")
      ? (aspectSetting?.value as "PORTRAIT" | "LANDSCAPE" | "SQUARE")
      : "PORTRAIT";

    return {
      youtubeUrl: urlSetting?.value || "",
      tagline: taglineSetting?.value || "Showcase Studio",
      title: titleSetting?.value || "Intensional. Tenang. Abadi.",
      description1: desc1Setting?.value || "Pendekatan kami berakar pada observasi, bukan orkestrasi. Kami percaya bahwa gambar yang paling kuat lahir dari interaksi yang jujur, bukan pose yang dipaksakan. Dengan menjaga kehadiran yang tenang dan tidak mengganggu, kami membiarkan keindahan alami kisah Anda mengalir.",
      description2: desc2Setting?.value || "Saksikan visualisasi cerita karya kami melalui video dokumentasi di samping, yang dikomposisikan dan dikurasi secara estetik demi hasil yang abadi.",
      aspectRatio,
    };
  }
}
