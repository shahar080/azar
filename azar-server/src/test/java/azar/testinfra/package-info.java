package azar.testinfra;

/**
 * Test Infrastructure package
 * <p>
 * Overview
 * This package contains small, focused utilities that make writing tests simple and consistent across the project.
 * They are intentionally minimal, require no runtime boot, and avoid coupling tests to framework internals.
 * <p>
 * When to use what
 * - BaseUnitTest: Extend this for fast unit tests that use Mockito and do not require Quarkus to start.
 * - ResourceTestUtil: Use in unit tests of Resource classes to inject a minimal mocked RoutingContext.
 * - JsonTestUtil: Serialize/deserialize small payloads in tests without boilerplate.
 * - TestDataFactory: Central place to build commonly used sample objects (fixtures).
 * <p>
 * Unit tests vs HTTP tests
 * - Use unit tests (+ BaseUnitTest) for pure logic and for resources where you want to avoid HTTP stack costs.
 * - Use @QuarkusTest for HTTP/integration tests that validate security, filters, serialization and wiring.
 * <p>
 * Best practices
 * - Keep tests deterministic and isolated; avoid shared mutable state.
 * - Prefer descriptive test method names and focused assertions.
 * - Mock only the boundaries; verify behavior, not implementation details.
 * - For HTTP tests, prefer using @TestSecurity to model roles/users.
 */
