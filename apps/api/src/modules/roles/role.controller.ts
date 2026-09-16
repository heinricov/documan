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
  CreateRoleSchema,
  IdParamsSchema,
  RoleQuerySchema,
  UpdateRoleSchema,
  type CreateRole,
  type IdParams,
  type RoleQuery,
  type UpdateRole,
} from "@packages/validator"
import { ZodBody, ZodParams, ZodQuery } from "../../common/zod.decorators.js"
import {
  createRoleSchema,
  paginatedRoleSchema,
  roleSchema,
  updateRoleSchema,
} from "./role.swagger.js"
import { RoleService } from "./role.service.js"

/**
 * ============================================================
 *  Role Controller
 * ============================================================
 *
 * Endpoint CRUD roles. Validasi memakai zod schema dari
 * @packages/validator (SSOT) via @ZodBody/@ZodQuery/@ZodParams.
 * Response otomatis dibungkus pipeline global (@packages/core format).
 */
@Controller("roles")
@ApiTags("roles")
export class RoleController {
  constructor(
    @Inject(RoleService) private readonly roleService: RoleService
  ) {}

  @Get()
  @ApiOperation({ summary: "Daftar roles (paginasi)" })
  @ApiOkResponse({
    description: "Daftar roles terpaginasi",
    schema: paginatedRoleSchema,
  })
  findAll(@ZodQuery({ zod: RoleQuerySchema }) query: RoleQuery) {
    return this.roleService.findAll(query)
  }

  @Post()
  @ApiOperation({ summary: "Buat role baru" })
  @ApiBody({ schema: createRoleSchema })
  @ApiOkResponse({ description: "Role berhasil dibuat", schema: roleSchema })
  @ApiResponse({ status: 400, description: "Validasi gagal" })
  @ApiResponse({ status: 409, description: "Title role sudah ada" })
  create(@ZodBody({ zod: CreateRoleSchema }) body: CreateRole) {
    return this.roleService.create(body)
  }

  @Get(":id")
  @ApiOperation({ summary: "Detail role berdasarkan ID" })
  @ApiParam({ name: "id", description: "UUID role" })
  @ApiOkResponse({ description: "Detail role", schema: roleSchema })
  @ApiResponse({ status: 400, description: "ID tidak valid" })
  @ApiResponse({ status: 404, description: "Role tidak ditemukan" })
  findOne(@ZodParams({ zod: IdParamsSchema }) params: IdParams) {
    return this.roleService.findById(params.id)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Perbarui role" })
  @ApiParam({ name: "id", description: "UUID role" })
  @ApiBody({ schema: updateRoleSchema })
  @ApiOkResponse({ description: "Role diperbarui", schema: roleSchema })
  @ApiResponse({ status: 400, description: "Validasi gagal" })
  @ApiResponse({ status: 404, description: "Role tidak ditemukan" })
  @ApiResponse({ status: 409, description: "Title role sudah ada" })
  update(
    @ZodParams({ zod: IdParamsSchema }) params: IdParams,
    @ZodBody({ zod: UpdateRoleSchema }) body: UpdateRole
  ) {
    return this.roleService.update(params.id, body)
  }

  @Delete(":id")
  @ApiOperation({ summary: "Hapus role" })
  @ApiParam({ name: "id", description: "UUID role" })
  @ApiOkResponse({ description: "Role dihapus", schema: roleSchema })
  @ApiResponse({ status: 400, description: "ID tidak valid" })
  @ApiResponse({ status: 404, description: "Role tidak ditemukan" })
  remove(@ZodParams({ zod: IdParamsSchema }) params: IdParams) {
    return this.roleService.remove(params.id)
  }
}