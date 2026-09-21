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
  CreateDocumentReceiptSchema,
  IdParamsSchema,
  DocumentReceiptQuerySchema,
  UpdateDocumentReceiptSchema,
  type CreateDocumentReceipt,
  type IdParams,
  type DocumentReceiptQuery,
  type UpdateDocumentReceipt,
} from "@packages/validator"
import { ZodBody, ZodParams, ZodQuery } from "../../common/zod.decorators.js"
import { CurrentUser, Roles } from "../../common/auth.js"
import {
  createDocumentReceiptSchema,
  paginatedDocumentReceiptSchema,
  documentReceiptSchema,
  updateDocumentReceiptSchema,
} from "./document-receipt.swagger.js"
import { DocumentReceiptService } from "./document-receipt.service.js"

/**
 * ============================================================
 *  DocumentReceipt Controller
 * ============================================================
 *
 * Endpoint CRUD document receipts.
 */
@Controller("document-receipts")
@ApiTags("document-receipts")
@ApiBearerAuth()
export class DocumentReceiptController {
  constructor(
    @Inject(DocumentReceiptService)
    private readonly documentReceiptService: DocumentReceiptService
  ) {}

  @Get()
  @ApiOperation({ summary: "Daftar document receipts (paginasi)" })
  @ApiOkResponse({
    description: "Daftar document receipts terpaginasi",
    schema: paginatedDocumentReceiptSchema,
  })
  findAll(@ZodQuery({ zod: DocumentReceiptQuerySchema }) query: DocumentReceiptQuery) {
    return this.documentReceiptService.findAll(query)
  }

  @Post()
  @Roles("admin")
  @ApiOperation({ summary: "Buat document receipt baru" })
  @ApiBody({ schema: createDocumentReceiptSchema })
  @ApiOkResponse({ description: "Document receipt berhasil dibuat", schema: documentReceiptSchema })
  @ApiResponse({ status: 400, description: "Validasi gagal" })
  create(
    @CurrentUser("userId") userId: string,
    @ZodBody({ zod: CreateDocumentReceiptSchema }) body: CreateDocumentReceipt
  ) {
    return this.documentReceiptService.create({
      title: body.title,
      description: body.description,
      docTypeId: body.docTypeId,
      boxId: body.boxId,
      userId,
    })
  }

  @Get(":id")
  @ApiOperation({ summary: "Detail document receipt berdasarkan ID" })
  @ApiParam({ name: "id", description: "UUID document receipt" })
  @ApiOkResponse({ description: "Detail document receipt", schema: documentReceiptSchema })
  @ApiResponse({ status: 400, description: "ID tidak valid" })
  @ApiResponse({ status: 404, description: "Document receipt tidak ditemukan" })
  findOne(@ZodParams({ zod: IdParamsSchema }) params: IdParams) {
    return this.documentReceiptService.findById(params.id)
  }

  @Patch(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Perbarui document receipt" })
  @ApiParam({ name: "id", description: "UUID document receipt" })
  @ApiBody({ schema: updateDocumentReceiptSchema })
  @ApiOkResponse({ description: "Document receipt diperbarui", schema: documentReceiptSchema })
  @ApiResponse({ status: 400, description: "Validasi gagal" })
  @ApiResponse({ status: 404, description: "Document receipt tidak ditemukan" })
  update(
    @ZodParams({ zod: IdParamsSchema }) params: IdParams,
    @ZodBody({ zod: UpdateDocumentReceiptSchema }) body: UpdateDocumentReceipt
  ) {
    return this.documentReceiptService.update(params.id, body)
  }

  @Delete(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Hapus document receipt" })
  @ApiParam({ name: "id", description: "UUID document receipt" })
  @ApiOkResponse({ description: "Document receipt dihapus", schema: documentReceiptSchema })
  @ApiResponse({ status: 400, description: "ID tidak valid" })
  @ApiResponse({ status: 404, description: "Document receipt tidak ditemukan" })
  remove(@ZodParams({ zod: IdParamsSchema }) params: IdParams) {
    return this.documentReceiptService.remove(params.id)
  }
}
