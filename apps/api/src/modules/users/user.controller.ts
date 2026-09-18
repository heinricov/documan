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
  CreateUserSchema,
  IdParamsSchema,
  UserQuerySchema,
  UpdateUserSchema,
  type CreateUser,
  type IdParams,
  type UserQuery,
  type UpdateUser,
} from "@packages/validator"
import { ZodBody, ZodParams, ZodQuery } from "../../common/zod.decorators.js"
import {
  createUserSchema,
  paginatedUserSchema,
  userSchema,
  updateUserSchema,
} from "./user.swagger.js"
import { UserService } from "./user.service.js"

/**
 * ============================================================
 *  User Controller
 * ============================================================
 *
 * Endpoint CRUD users. Validasi memakai zod schema dari
 * @packages/validator (SSOT) via @ZodBody/@ZodQuery/@ZodParams.
 * Response otomatis dibungkus pipeline global (@packages/core format).
 */
@Controller("users")
@ApiTags("users")
export class UserController {
  constructor(
    @Inject(UserService) private readonly userService: UserService
  ) {}

  @Get()
  @ApiOperation({ summary: "Daftar users (paginasi)" })
  @ApiOkResponse({
    description: "Daftar users terpaginasi",
    schema: paginatedUserSchema,
  })
  findAll(@ZodQuery({ zod: UserQuerySchema }) query: UserQuery) {
    return this.userService.findAll(query)
  }

  @Post()
  @ApiOperation({ summary: "Buat user baru" })
  @ApiBody({ schema: createUserSchema })
  @ApiOkResponse({ description: "User berhasil dibuat", schema: userSchema })
  @ApiResponse({ status: 400, description: "Validasi gagal" })
  @ApiResponse({ status: 404, description: "Role tidak ditemukan" })
  @ApiResponse({ status: 409, description: "Username atau email sudah ada" })
  create(@ZodBody({ zod: CreateUserSchema }) body: CreateUser) {
    return this.userService.create(body)
  }

  @Get(":id")
  @ApiOperation({ summary: "Detail user berdasarkan ID" })
  @ApiParam({ name: "id", description: "UUID user" })
  @ApiOkResponse({ description: "Detail user", schema: userSchema })
  @ApiResponse({ status: 400, description: "ID tidak valid" })
  @ApiResponse({ status: 404, description: "User tidak ditemukan" })
  findOne(@ZodParams({ zod: IdParamsSchema }) params: IdParams) {
    return this.userService.findById(params.id)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Perbarui user" })
  @ApiParam({ name: "id", description: "UUID user" })
  @ApiBody({ schema: updateUserSchema })
  @ApiOkResponse({ description: "User diperbarui", schema: userSchema })
  @ApiResponse({ status: 400, description: "Validasi gagal" })
  @ApiResponse({ status: 404, description: "User atau Role tidak ditemukan" })
  @ApiResponse({ status: 409, description: "Username atau email sudah ada" })
  update(
    @ZodParams({ zod: IdParamsSchema }) params: IdParams,
    @ZodBody({ zod: UpdateUserSchema }) body: UpdateUser
  ) {
    return this.userService.update(params.id, body)
  }

  @Delete(":id")
  @ApiOperation({ summary: "Hapus user" })
  @ApiParam({ name: "id", description: "UUID user" })
  @ApiOkResponse({ description: "User dihapus", schema: userSchema })
  @ApiResponse({ status: 400, description: "ID tidak valid" })
  @ApiResponse({ status: 404, description: "User tidak ditemukan" })
  remove(@ZodParams({ zod: IdParamsSchema }) params: IdParams) {
    return this.userService.remove(params.id)
  }
}
