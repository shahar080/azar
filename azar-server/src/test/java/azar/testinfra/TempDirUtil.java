package azar.testinfra;

import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.FileAlreadyExistsException;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.StandardOpenOption;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.Objects;
import java.util.stream.Stream;

/**
 * Auto-closeable temporary directory helper for tests.
 * <p>
 * Usage:
 * try (TempDirUtil tmp = TempDirUtil.create()) {
 * Path file = tmp.writeString("data.txt", "hello");
 * String s = tmp.readString("data.txt");
 * }
 * // directory and its contents are removed on close
 */
public final class TempDirUtil implements AutoCloseable {
    private final Path dir;
    private final Charset charset;
    private volatile boolean closed;

    private TempDirUtil(Path dir, Charset charset) {
        this.dir = Objects.requireNonNull(dir, "dir");
        this.charset = Objects.requireNonNull(charset, "charset");
    }

    /**
     * Creates a new temporary directory with UTF-8 default charset.
     */
    public static TempDirUtil create() {
        return create(StandardCharsets.UTF_8);
    }

    /**
     * Creates a new temporary directory with the provided default charset for read/write helpers.
     */
    public static TempDirUtil create(Charset charset) {
        try {
            Path d = Files.createTempDirectory("test-tmp-");
            return new TempDirUtil(d, charset);
        } catch (IOException e) {
            throw new RuntimeException("Failed to create temp directory", e);
        }
    }

    public Path path() {
        return dir;
    }

    public Path resolve(String first, String... more) {
        return dir.resolve(Paths.get(first, more));
    }

    /**
     * Ensures parent folders exist and writes given content to the file (overwrites if exists).
     */
    public Path writeString(String relative, String content) {
        Path p = resolve(relative);
        try {
            if (p.getParent() != null) Files.createDirectories(p.getParent());
            Files.writeString(p, content == null ? "" : content, charset, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
            return p;
        } catch (IOException e) {
            throw new RuntimeException("Failed to write file: " + p, e);
        }
    }

    /**
     * Reads file content as string with the default charset.
     */
    public String readString(String relative) {
        Path p = resolve(relative);
        try {
            return Files.readString(p, charset);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file: " + p, e);
        }
    }

    /**
     * Creates an empty file, creating parent directories if necessary.
     */
    public Path createFile(String relative) {
        Path p = resolve(relative);
        try {
            if (p.getParent() != null) Files.createDirectories(p.getParent());
            return Files.createFile(p);
        } catch (FileAlreadyExistsException e) {
            return p; // treat as idempotent
        } catch (IOException e) {
            throw new RuntimeException("Failed to create file: " + p, e);
        }
    }

    /**
     * Lists direct children (non-recursive). Caller should close the stream.
     */
    public Stream<Path> list() {
        try {
            return Files.list(dir);
        } catch (IOException e) {
            throw new RuntimeException("Failed to list directory: " + dir, e);
        }
    }

    @Override
    public void close() {
        if (closed) return;
        closed = true;
        if (!Files.exists(dir)) return;
        try {
            Files.walkFileTree(dir, new SimpleFileVisitor<>() {
                @Override
                public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                    Files.deleteIfExists(file);
                    return FileVisitResult.CONTINUE;
                }

                @Override
                public FileVisitResult postVisitDirectory(Path d, IOException exc) throws IOException {
                    Files.deleteIfExists(d);
                    return FileVisitResult.CONTINUE;
                }
            });
        } catch (IOException e) {
            // Best-effort cleanup; surface as runtime to fail fast in tests
            throw new RuntimeException("Failed to delete temp directory: " + dir, e);
        }
    }
}
