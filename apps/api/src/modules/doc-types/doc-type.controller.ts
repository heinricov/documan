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
  CreateDocTypeSchema,
  IdParamsSchema,
  DocTypeQuerySchema,
  UpdateDocTypeSchema,
  type CreateDocType,
  type IdParams,
  type DocTypeQuery,
  type UpdateDocType,
} from "@packages/validator"
import { ZodBody, ZodParams, ZodQuery } from "../../common/zod.decorators.js"
import { Roles } from "../../common/auth.js"
import {
  createDocTypeSchema,
  paginatedDocTypeSchema,
  docTypeSchema,
  updateDocTypeSchema,
} from "./doc-type.swagger.js"
import { DocTypeService } from "./doc-type.service.js"

/**
 * ============================================================
 *  DocType Controller
 * ============================================================
 *
 * Endpoint CRUD doc types.
 */
@Controller("doc-types")
@ApiTags("doc-types")
@ApiBearerAuth()
export class DocTypeController {
  constructor(
    @Inject(DocTypeService) private readonly docTypeService: DocTypeService
  ) {}

  @Get()
  @ApiOperation({ summary: "Daftar doc types (paginasi)" })
  @ApiOkResponse({
    description: "Daftar doc types terpaginasi",
    schema: paginatedDocTypeSchema,
  })
  findAll(@ZodQuery({ zod: DocTypeQuerySchema }) query: DocTypeQuery) {
    return this.docTypeService.findAll(query)
  }

  @Post()
  @Roles("admin")
  @ApiOperation({ summary: "Buat doc type baru" })
  @ApiBody({ schema: createDocTypeSchema })
  @ApiOkResponse({ description: "DocType berhasil dibuat", schema: docTypeSchema })
  @ApiResponse({ status: 400, description: "Validasi gagal" })
  @ApiResponse({ status: 409, description: "Title sudah ada" })
  create(@ZodBody({ zod: CreateDocTypeSchema }) body: CreateDocType) {
    return this.docTypeService.create(body)
  }

  @Get(":id")
  @ApiOperation({ summary: "Detail doc type berdasarkan ID" })
  @ApiParam({ name: "id", description: "UUID doc type" })
  @ApiOkResponse({ description: "Detail doc type", schema: docTypeSchema })
  @ApiResponse({ status: 400, description: "ID tidak valid" })
  @ApiResponse({ status: 404, description: "DocType tidak ditemukan" })
  findOne(@ZodParams({ zod: IdParamsSchema }) params: IdParams) {
    return this.docTypeService.findById(params.id)
  }

  @Patch(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Perbarui doc type" })
  @ApiParam({ name: "id", description: "UUID doc type" })
  @ApiBody({ schema: updateDocTypeSchema })
  @ApiOkResponse({ description: "DocType diperbarui", schema: docTypeSchema })
  @ApiResponse({ status: 400, description: "Validasi gagal" })
  @ApiResponse({ status: 404, description: "DocType tidak ditemukan" })
  @ApiResponse({ status: 409, description: "Title sudah ada" })
  update(
    @ZodParams({ zod: IdParamsSchema }) params: IdParams,
    @ZodBody({ zod: UpdateDocTypeSchema }) body: UpdateDocType
  ) {
    return this.docTypeService.update(params.id, body)
  }

  @Delete(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Hapus doc type" })
  @ApiParam({ name: "id", description: "UUID doc type" })
  @ApiOkResponse({ description: "DocType dihapus", schema: docTypeSchema })
  @ApiResponse({ status: 400, description: "ID tidak valid" })
  @ApiResponse({ status: 404, description: "DocType tidak ditemukan" })
  remove(@ZodParams({ zod: IdParamsSchema }) params: IdParams) {
    return this.docTypeService.remove(params.id)
  }
}