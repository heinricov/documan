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
  CreateBoxSchema,
  IdParamsSchema,
  BoxQuerySchema,
  UpdateBoxSchema,
  type CreateBox,
  type IdParams,
  type BoxQuery,
  type UpdateBox,
} from "@packages/validator"
import { ZodBody, ZodParams, ZodQuery } from "../../common/zod.decorators.js"
import { Roles } from "../../common/auth.js"
import {
  createBoxSchema,
  paginatedBoxSchema,
  boxSchema,
  updateBoxSchema,
} from "./box.swagger.js"
import { BoxService } from "./box.service.js"

/**
 * ============================================================
 *  Box Controller
 * ============================================================
 *
 * Endpoint CRUD boxes.
 */
@Controller("boxes")
@ApiTags("boxes")
@ApiBearerAuth()
export class BoxController {
  constructor(@Inject(BoxService) private readonly boxService: BoxService) {}

  @Get()
  @ApiOperation({ summary: "Daftar boxes (paginasi)" })
  @ApiOkResponse({
    description: "Daftar boxes terpaginasi",
    schema: paginatedBoxSchema,
  })
  findAll(@ZodQuery({ zod: BoxQuerySchema }) query: BoxQuery) {
    return this.boxService.findAll(query)
  }

  @Post()
  @Roles("admin")
  @ApiOperation({ summary: "Buat box baru" })
  @ApiBody({ schema: createBoxSchema })
  @ApiOkResponse({ description: "Box berhasil dibuat", schema: boxSchema })
  @ApiResponse({ status: 400, description: "Validasi gagal" })
  @ApiResponse({ status: 409, description: "Nomor box sudah ada" })
  create(@ZodBody({ zod: CreateBoxSchema }) body: CreateBox) {
    return this.boxService.create(body)
  }

  @Get(":id")
  @ApiOperation({ summary: "Detail box berdasarkan ID" })
  @ApiParam({ name: "id", description: "UUID box" })
  @ApiOkResponse({ description: "Detail box", schema: boxSchema })
  @ApiResponse({ status: 400, description: "ID tidak valid" })
  @ApiResponse({ status: 404, description: "Box tidak ditemukan" })
  findOne(@ZodParams({ zod: IdParamsSchema }) params: IdParams) {
    return this.boxService.findById(params.id)
  }

  @Patch(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Perbarui box" })
  @ApiParam({ name: "id", description: "UUID box" })
  @ApiBody({ schema: updateBoxSchema })
  @ApiOkResponse({ description: "Box diperbarui", schema: boxSchema })
  @ApiResponse({ status: 400, description: "Validasi gagal" })
  @ApiResponse({ status: 404, description: "Box tidak ditemukan" })
  @ApiResponse({ status: 409, description: "Nomor box sudah ada" })
  update(
    @ZodParams({ zod: IdParamsSchema }) params: IdParams,
    @ZodBody({ zod: UpdateBoxSchema }) body: UpdateBox
  ) {
    return this.boxService.update(params.id, body)
  }

  @Delete(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Hapus box" })
  @ApiParam({ name: "id", description: "UUID box" })
  @ApiOkResponse({ description: "Box dihapus", schema: boxSchema })
  @ApiResponse({ status: 400, description: "ID tidak valid" })
  @ApiResponse({ status: 404, description: "Box tidak ditemukan" })
  remove(@ZodParams({ zod: IdParamsSchema }) params: IdParams) {
    return this.boxService.remove(params.id)
  }
}