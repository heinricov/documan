import { Controller, Get, Post, Patch, Delete, Inject } from "@nestjs/common"
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from "@nestjs/swagger"
import {
  CreatePartnerSchema,
  IdParamsSchema,
  PartnerQuerySchema,
  UpdatePartnerSchema,
  type CreatePartner,
  type IdParams,
  type PartnerQuery,
  type UpdatePartner,
} from "@packages/validator"
import { ZodBody, ZodParams, ZodQuery } from "../../common/zod.decorators.js"
import { Roles } from "../../common/auth.js"
import {
  createPartnerSchema,
  paginatedPartnerSchema,
  partnerSchema,
  updatePartnerSchema,
} from "./partner.swagger.js"
import { PartnerService } from "./partner.service.js"

/**
 * ============================================================
 *  Partner Controller
 * ============================================================
 *
 * Endpoint CRUD partners.
 */
@Controller("partners")
@ApiTags("partners")
@ApiBearerAuth()
export class PartnerController {
  constructor(
    @Inject(PartnerService) private readonly partnerService: PartnerService
  ) {}

  @Get()
  @ApiOperation({ summary: "Daftar partners (paginasi)" })
  @ApiOkResponse({
    description: "Daftar partners terpaginasi",
    schema: paginatedPartnerSchema,
  })
  findAll(@ZodQuery({ zod: PartnerQuerySchema }) query: PartnerQuery) {
    return this.partnerService.findAll(query)
  }

  @Post()
  @Roles("admin")
  @ApiOperation({ summary: "Buat partner baru" })
  @ApiBody({ schema: createPartnerSchema })
  @ApiOkResponse({ description: "Partner berhasil dibuat", schema: partnerSchema })
  @ApiResponse({ status: 400, description: "Validasi gagal" })
  @ApiResponse({ status: 409, description: "Nama sudah ada" })
  create(@ZodBody({ zod: CreatePartnerSchema }) body: CreatePartner) {
    return this.partnerService.create(body)
  }

  @Get(":id")
  @ApiOperation({ summary: "Detail partner berdasarkan ID" })
  @ApiParam({ name: "id", description: "UUID partner" })
  @ApiOkResponse({ description: "Detail partner", schema: partnerSchema })
  @ApiResponse({ status: 400, description: "ID tidak valid" })
  @ApiResponse({ status: 404, description: "Partner tidak ditemukan" })
  findOne(@ZodParams({ zod: IdParamsSchema }) params: IdParams) {
    return this.partnerService.findById(params.id)
  }

  @Patch(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Perbarui partner" })
  @ApiParam({ name: "id", description: "UUID partner" })
  @ApiBody({ schema: updatePartnerSchema })
  @ApiOkResponse({ description: "Partner diperbarui", schema: partnerSchema })
  @ApiResponse({ status: 400, description: "Validasi gagal" })
  @ApiResponse({ status: 404, description: "Partner tidak ditemukan" })
  @ApiResponse({ status: 409, description: "Nama sudah ada" })
  update(
    @ZodParams({ zod: IdParamsSchema }) params: IdParams,
    @ZodBody({ zod: UpdatePartnerSchema }) body: UpdatePartner
  ) {
    return this.partnerService.update(params.id, body)
  }

  @Delete(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Hapus partner" })
  @ApiParam({ name: "id", description: "UUID partner" })
  @ApiOkResponse({ description: "Partner dihapus", schema: partnerSchema })
  @ApiResponse({ status: 400, description: "ID tidak valid" })
  @ApiResponse({ status: 404, description: "Partner tidak ditemukan" })
  remove(@ZodParams({ zod: IdParamsSchema }) params: IdParams) {
    return this.partnerService.remove(params.id)
  }
}