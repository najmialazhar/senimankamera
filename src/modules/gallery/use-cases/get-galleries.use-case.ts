import { GalleryRepository } from "../repositories/gallery.repository";

export class GetGalleriesUseCase {
  constructor(private galleryRepository: GalleryRepository) {}

  async execute() {
    return this.galleryRepository.findAll();
  }
}
