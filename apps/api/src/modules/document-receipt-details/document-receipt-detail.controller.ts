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
  CreateDocumentReceiptDetailSchema,
  IdParamsSchema,
  DocumentReceiptDetailQuerySchema,
  UpdateDocumentReceiptDetailSchema,
  type CreateDocumentReceiptDetail,
  type IdParams,
  type DocumentReceiptDetailQuery,
  type UpdateDocumentReceiptDetail,
} from "@packages/validator"
import { ZodBody, ZodParams, ZodQuery } from "../../common/zod.decorators.js"
import { Roles } from "../../common/auth.js"
import {
  createDocumentReceiptDetailSchema,
  paginatedDocumentReceiptDetailSchema,
  documentReceiptDetailSchema,
  updateDocumentReceiptDetailSchema,
} from "./document-receipt-detail.swagger.js"
import { DocumentReceiptDetailService } from "./document-receipt-detail.service.js"

/**
 * ============================================================
 *  DocumentReceiptDetail Controller
 * ============================================================
 *
 * Endpoint CRUD document receipt details.
 */
@Controller("document-receipt-details")
@ApiTags("document-receipt-details")
@ApiBearerAuth()
export class DocumentReceiptDetailController {
  constructor(
    @Inject(DocumentReceiptDetailService)
    private readonly service: DocumentReceiptDetailService
  ) {}

  @Get()
  @ApiOperation({ summary: "Daftar document receipt details (paginasi)" })
  @ApiOkResponse({
    description: "Daftar document receipt details terpaginasi",
    schema: paginatedDocumentReceiptDetailSchema,
  })
  findAll(@ZodQuery({ zod: DocumentReceiptDetailQuerySchema }) query: DocumentReceiptDetailQuery) {
    return this.service.findAll(query)
  }

  @Post()
  @Roles("admin")
  @ApiOperation({ summary: "Buat document receipt detail baru" })
  @ApiBody({ schema: createDocumentReceiptDetailSchema })
  @ApiOkResponse({ description: "Document receipt detail berhasil dibuat", schema: documentReceiptDetailSchema })
  @ApiResponse({ status: 400, description: "Validasi gagal" })
  create(@ZodBody({ zod: CreateDocumentReceiptDetailSchema }) body: CreateDocumentReceiptDetail) {
    return this.service.create(body)
  }

  @Get(":id")
  @ApiOperation({ summary: "Detail document receipt detail berdasarkan ID" })
  @ApiParam({ name: "id", description: "UUID document receipt detail" })
  @ApiOkResponse({ description: "Detail document receipt detail", schema: documentReceiptDetailSchema })
  @ApiResponse({ status: 400, description: "ID tidak valid" })
  @ApiResponse({ status: 404, description: "Document receipt detail tidak ditemukan" })
  findOne(@ZodParams({ zod: IdParamsSchema }) params: IdParams) {
    return this.service.findById(params.id)
  }

  @Patch(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Perbarui document receipt detail" })
  @ApiParam({ name: "id", description: "UUID document receipt detail" })
  @ApiBody({ schema: updateDocumentReceiptDetailSchema })
  @ApiOkResponse({ description: "Document receipt detail diperbarui", schema: documentReceiptDetailSchema })
  @ApiResponse({ status: 400, description: "Validasi gagal" })
  @ApiResponse({ status: 404, description: "Document receipt detail tidak ditemukan" })
  update(
    @ZodParams({ zod: IdParamsSchema }) params: IdParams,
    @ZodBody({ zod: UpdateDocumentReceiptDetailSchema }) body: UpdateDocumentReceiptDetail
  ) {
    return this.service.update(params.id, body)
  }

  @Delete(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Hapus document receipt detail" })
  @ApiParam({ name: "id", description: "UUID document receipt detail" })
  @ApiOkResponse({ description: "Document receipt detail dihapus", schema: documentReceiptDetailSchema })
  @ApiResponse({ status: 400, description: "ID tidak valid" })
  @ApiResponse({ status: 404, description: "Document receipt detail tidak ditemukan" })
  remove(@ZodParams({ zod: IdParamsSchema }) params: IdParams) {
    return this.service.remove(params.id)
  }
}
