import { ApplicationError } from "../../shared/errors/application-error";
import type { AdminComicDetail } from "../contracts/admin-comic-command-repository";
import type { AdminComicReadRepository } from "../contracts/admin-comic-read-repository";

export class GetAdminComicById {
  constructor(private readonly adminComicReadRepository: AdminComicReadRepository) {}

  async execute(comicId: number): Promise<AdminComicDetail> {
    const comic = await this.adminComicReadRepository.findComicById(comicId);

    if (!comic) {
      throw new ApplicationError({
        code: "ADMIN_COMIC_NOT_FOUND",
        message: `Comic ${comicId} was not found.`,
        statusCode: 404,
      });
    }

    return comic;
  }
}
