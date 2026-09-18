import { Controller, Get, Post, Patch, Delete, Inject } from "@nestjs/common"
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger"
import {
  CreateSubsidiarySchema,
  IdParamsSchema,
  SubsidiaryQuerySchema,
  UpdateSubsidiarySchema,
  type CreateSubsidiary,
  type IdParams,
  type SubsidiaryQuery,
  type UpdateSubsidiary,
} from "@packages/validator"
import { ZodBody, ZodParams, ZodQuery } from "../../common/zod.decorators.js"
import {
  createSubsidiarySchema,
  paginatedSubsidiarySchema,
  subsidiarySchema,
  updateSubsidiarySchema,
} from "./subsidiary.swagger.js"
import { SubsidiaryService } from "./subsidiary.service.js"

/**
 * ============================================================
 *  Subsidiary Controller
 * ============================================================
 *
 * Endpoint CRUD subsidiaries. Validasi memakai zod schema dari
 * @packages/validator (SSOT) via @ZodBody/@ZodQuery/@ZodParams.
 * Response otomatis dibungkus pipeline global (@packages/core format).
 */
@Controller("subsidiaries")
@ApiTags("subsidiaries")
export class SubsidiaryController {
  constructor(
    @Inject(SubsidiaryService) private readonly subsidiaryService: SubsidiaryService
  ) {}

  @Get()
  @ApiOperation({ summary: "Daftar subsidiaries (paginasi)" })
  @ApiOkResponse({
    description: "Daftar subsidiaries terpaginasi",
    schema: paginatedSubsidiarySchema,
  })
  findAll(@ZodQuery({ zod: SubsidiaryQuerySchema }) query: SubsidiaryQuery) {
    return this.subsidiaryService.findAll(query)
  }

  @Post()
  @ApiOperation({ summary: "Buat subsidiary baru" })
  @ApiBody({ schema: createSubsidiarySchema })
  @ApiOkResponse({ description: "Subsidiary berhasil dibuat", schema: subsidiarySchema })
  @ApiResponse({ status: 400, description: "Validasi gagal" })
  @ApiResponse({ status: 409, description: "Title atau nama sudah ada" })
  create(@ZodBody({ zod: CreateSubsidiarySchema }) body: CreateSubsidiary) {
    return this.subsidiaryService.create(body)
  }

  @Get(":id")
  @ApiOperation({ summary: "Detail subsidiary berdasarkan ID" })
  @ApiParam({ name: "id", description: "UUID subsidiary" })
  @ApiOkResponse({ description: "Detail subsidiary", schema: subsidiarySchema })
  @ApiResponse({ status: 400, description: "ID tidak valid" })
  @ApiResponse({ status: 404, description: "Subsidiary tidak ditemukan" })
  findOne(@ZodParams({ zod: IdParamsSchema }) params: IdParams) {
    return this.subsidiaryService.findById(params.id)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Perbarui subsidiary" })
  @ApiParam({ name: "id", description: "UUID subsidiary" })
  @ApiBody({ schema: updateSubsidiarySchema })
  @ApiOkResponse({ description: "Subsidiary diperbarui", schema: subsidiarySchema })
  @ApiResponse({ status: 400, description: "Validasi gagal" })
  @ApiResponse({ status: 404, description: "Subsidiary tidak ditemukan" })
  @ApiResponse({ status: 409, description: "Title atau nama sudah ada" })
  update(
    @ZodParams({ zod: IdParamsSchema }) params: IdParams,
    @ZodBody({ zod: UpdateSubsidiarySchema }) body: UpdateSubsidiary
  ) {
    return this.subsidiaryService.update(params.id, body)
  }

  @Delete(":id")
  @ApiOperation({ summary: "Hapus subsidiary" })
  @ApiParam({ name: "id", description: "UUID subsidiary" })
  @ApiOkResponse({ description: "Subsidiary dihapus", schema: subsidiarySchema })
  @ApiResponse({ status: 400, description: "ID tidak valid" })
  @ApiResponse({ status: 404, description: "Subsidiary tidak ditemukan" })
  remove(@ZodParams({ zod: IdParamsSchema }) params: IdParams) {
    return this.subsidiaryService.remove(params.id)
  }
}