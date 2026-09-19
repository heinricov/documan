import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { loadEnv } from "@configs/environment"
import { AppModule } from "../src/app.module.js"
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter.js"
import { TransformInterceptor } from "../src/common/interceptors/transform.interceptor.js"
import { cleanDatabase, seedRole, createTestToken, authHeader } from "@packages/testing"

loadEnv()

describe("App (e2e)", () => {
  let app: INestApplication

  beforeAll(async () => {
    await cleanDatabase()

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalFilters(new HttpExceptionFilter())
    app.useGlobalInterceptors(new TransformInterceptor())
    await app.init()
  }, 15_000)

  afterAll(async () => {
    await cleanDatabase()
    await app.close()
  })

  describe("GET /health", () => {
    it("mengembalikan liveness (200)", () => {
      return request(app.getHttpServer())
        .get("/health")
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true)
          expect(res.body.data).toHaveProperty("status", "ok")
        })
    })

    it("mengembalikan readiness (200 jika DB ok)", () => {
      return request(app.getHttpServer())
        .get("/health/ready")
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true)
          expect(res.body.data).toHaveProperty("status", "ready")
        })
    })
  })

  describe("GET /roles", () => {
    it("publik — bisa diakses tanpa token", () => {
      return request(app.getHttpServer())
        .get("/roles")
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true)
          expect(Array.isArray(res.body.data)).toBe(true)
        })
    })
  })

  describe("DocType endpoints", () => {
    let adminToken: string
    let docTypeId: string

    beforeAll(async () => {
      adminToken = await createTestToken({ role: "admin" }).then(authHeader)
    })

    it("403 — non-admin tidak boleh POST /doc-types", async () => {
      return request(app.getHttpServer())
        .post("/doc-types")
        .set("Authorization", authHeader(await createTestToken({ role: "viewer" })))
        .send({ title: "si" })
        .expect(403)
    })

    it("POST /doc-types — admin membuat doc type", () => {
      return request(app.getHttpServer())
        .post("/doc-types")
        .set("Authorization", adminToken)
        .send({ title: `si-${Date.now()}`, description: "Surat Jalan" })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true)
          expect(res.body.data).toHaveProperty("title")
          expect(res.body.data).toHaveProperty("description", "Surat Jalan")
          docTypeId = res.body.data.id
        })
    })

    it("409 — title duplikat ditolak", async () => {
      const created = await request(app.getHttpServer())
        .post("/doc-types")
        .set("Authorization", adminToken)
        .send({ title: `dup-${Date.now()}` })
        .expect(201)

      return request(app.getHttpServer())
        .post("/doc-types")
        .set("Authorization", adminToken)
        .send({ title: created.body.data.title })
        .expect(409)
    })

    it("GET /doc-types — admin bisa listing", () => {
      return request(app.getHttpServer())
        .get("/doc-types")
        .set("Authorization", adminToken)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true)
          expect(Array.isArray(res.body.data)).toBe(true)
        })
    })

    it("GET /doc-types/:id — detail doc type", () => {
      return request(app.getHttpServer())
        .get(`/doc-types/${docTypeId}`)
        .set("Authorization", adminToken)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty("id", docTypeId)
        })
    })

    it("PATCH /doc-types/:id — update description", () => {
      return request(app.getHttpServer())
        .patch(`/doc-types/${docTypeId}`)
        .set("Authorization", adminToken)
        .send({ description: "Surat Jalan Updated" })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty("description", "Surat Jalan Updated")
        })
    })

    it("DELETE /doc-types/:id — hapus doc type", () => {
      return request(app.getHttpServer())
        .delete(`/doc-types/${docTypeId}`)
        .set("Authorization", adminToken)
        .expect(200)
    })

    it("404 — get doc type yang sudah dihapus", () => {
      return request(app.getHttpServer())
        .get(`/doc-types/${docTypeId}`)
        .set("Authorization", adminToken)
        .expect(404)
    })
  })

  describe("Auth protection", () => {
    it("401 jika akses endpoint tanpa token", () => {
      return request(app.getHttpServer())
        .get("/users")
        .expect(401)
    })

    it("401 jika token tidak valid", () => {
      return request(app.getHttpServer())
        .get("/users")
        .set("Authorization", "Bearer invalid-token-xxxx")
        .expect(401)
    })
  })

  describe("Auth integration", () => {
    let adminToken: string
    let userToken: string
    const testUser = {
      username: `e2e-${Date.now()}`,
      email: `e2e-${Date.now()}@test.com`,
      password: "secure12345",
    }

    beforeAll(async () => {
      const adminRole = await seedRole({ title: "admin" })

      // Bootstrap: gunakan createTestToken untuk POST /users
      const bootstrapToken = await createTestToken({ role: "admin" })
      await request(app.getHttpServer())
        .post("/users")
        .set("Authorization", authHeader(bootstrapToken))
        .send({ ...testUser, roleId: adminRole.id })
        .expect(201)

      // Login dengan user yang baru dibuat → dapat token nyata
      const loginRes = await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: testUser.email, password: testUser.password })
        .expect(200)

      userToken = loginRes.body.data.token
      adminToken = userToken // user ini punya role admin
    })

    it("POST /auth/login — login berhasil", () => {
      return request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: testUser.email, password: testUser.password })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true)
          expect(res.body.data).toHaveProperty("token")
          expect(res.body.data.user).toHaveProperty("username", testUser.username)
        })
    })

    it("GET /auth/me — mengembalikan data user dengan token nyata", () => {
      return request(app.getHttpServer())
        .get("/auth/me")
        .set("Authorization", authHeader(adminToken))
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true)
          expect(res.body.data).toHaveProperty("username", testUser.username)
        })
    })

    it("GET /users — admin bisa mengakses (200)", () => {
      return request(app.getHttpServer())
        .get("/users")
        .set("Authorization", authHeader(adminToken))
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true)
          expect(Array.isArray(res.body.data)).toBe(true)
        })
    })

    it("POST /roles — admin bisa membuat role", () => {
      return request(app.getHttpServer())
        .post("/roles")
        .set("Authorization", authHeader(adminToken))
        .send({ title: `new-role-${Date.now()}` })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true)
          expect(res.body.data).toHaveProperty("title")
        })
    })

    it("403 — non-admin tidak boleh membuat role", async () => {
      const viewerToken = await createTestToken({ role: "viewer" })

      return request(app.getHttpServer())
        .post("/roles")
        .set("Authorization", authHeader(viewerToken))
        .send({ title: `should-fail-${Date.now()}` })
        .expect(403)
    })

    it("POST /auth/login — 401 jika password salah", () => {
      return request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: testUser.email, password: "wrongpassword" })
        .expect(401)
    })
  })
})
