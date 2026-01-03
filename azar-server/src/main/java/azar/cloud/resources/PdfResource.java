package azar.cloud.resources;

import java.nio.file.Files;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Objects;
import azar.cloud.dal.service.PdfFileService;
import azar.cloud.entities.db.PdfFile;
import azar.cloud.entities.requests.pdf.PdfDeleteRequest;
import azar.cloud.entities.requests.pdf.PdfUpdateRequest;
import static azar.cloud.utils.Constants.ADMIN_GROUP;
import static azar.cloud.utils.Constants.ADMIN_PREFIX_STRING;
import azar.shared.cache.CacheKeys;
import azar.shared.cache.CacheManager;
import azar.shared.entities.requests.BaseRequest;
import azar.shared.resources.BaseResource;
import azar.shared.utils.Utilities;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.common.annotation.Blocking;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Response;
import org.jboss.resteasy.reactive.RestForm;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Author: Shahar Azar
 * Date:   20/12/2024
 **/
@Path("/api/c" + ADMIN_PREFIX_STRING + "/pdf")
public class PdfResource extends BaseResource {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    @Inject
    SecurityIdentity identity;

    private final PdfFileService pdfFileService;
    private final CacheManager cacheManager;
    private final ObjectMapper objectMapper;

    public PdfResource(PdfFileService pdfFileService, CacheManager cacheManager,
                       ObjectMapper objectMapper) {
        this.pdfFileService = pdfFileService;
        this.cacheManager = cacheManager;
        this.objectMapper = objectMapper;
    }

    @Path("/upload")
    @POST
    @Blocking            // we do file IO + DB work here
    @Transactional       // PG LOBs + persist need a tx
    @Authenticated
    public Response uploadPdf(@RestForm String userName,
                              @RestForm("file") org.jboss.resteasy.reactive.multipart.FileUpload file) {
        if (userName == null || userName.isBlank()) {
            return badRequest("userName is required");
        }
        if (file == null || file.size() == 0) {
            return badRequest("No file uploaded");
        }

        java.nio.file.Path tmp = file.filePath(); // temp location managed by Quarkus
        byte[] bytes;
        try {
            bytes = Files.readAllBytes(tmp);
        } catch (Exception e) {
            return internalError("Failed to read uploaded file: %s".formatted(e.getMessage()));
        }

        PdfFile pdf = new PdfFile();
        pdf.setUploadedBy(userName);
        pdf.setFileName(file.fileName());
        pdf.setData(bytes);
        pdf.setContentType("application/pdf");
        pdf.setLabels(new ArrayList<>());
        pdf.setSize(Utilities.getHumanReadableSize(bytes));
        pdf.setUploadedAt(Instant.now());

        try {
            byte[] thumb = Utilities.generateThumbnail(pdf.getData());

            if (thumb.length == 0) {
                return internalError("Error generating thumbnail for %s".formatted(file.fileName()));
            }
            pdf.setThumbnail(thumb);
        } catch (Exception e) {
            return internalError("Error generating thumbnail for %s".formatted(file.fileName()));
        }

        try {
            PdfFile saved = pdfFileService.merge(pdf);
            pdfFileService.detach(saved);
            saved.setData(new byte[0]);
            // Cache thumbnail as Base64 to avoid JSON arrays of bytes
            String b64Thumb = Base64.getEncoder().encodeToString(saved.getThumbnail());
            cacheManager.put(CacheKeys.PDF_THUMBNAIL.formatted(saved.getId()), b64Thumb);

            safeDelete(tmp);

            return created(saved, "Successfully saved pdf %s".formatted(pdf.getFileName()));
        } catch (Exception e) {
            safeDelete(tmp);
            return internalError("Error saving %s : %s".formatted(file.fileName(), e.getMessage()));
        }
    }

    private void safeDelete(java.nio.file.Path p) {
        try {
            if (p != null) Files.deleteIfExists(p);
        } catch (Exception ignored) {
            logger.warn("Could not delete file {}", p);
        }
    }

    @Path("/getAll")
    @POST
    @Transactional
    public Response getAllPdfs(@QueryParam("page") int page, @QueryParam("limit") int limit, BaseRequest baseRequest) {
        if (page < 1 || limit < 1) {
            return badRequest("Page and limit must be greater than 0.");
        }

        List<PdfFile> pdfFileList = pdfFileService.getAllClientPaginated(page, limit);
        return ok(pdfFileList, "Returned %s PDFs to client (page: %s, limit: %s)".formatted(pdfFileList.size(), page, limit));
    }

    @Path("/delete/{id}")
    @POST
    @Transactional
    public Response deletePdfById(@PathParam("id") int pdfId, PdfDeleteRequest pdfDeleteRequest) {

        String dbPdfOwner = pdfFileService.getOwnerByPdfId(pdfId);
        if (Objects.equals(pdfDeleteRequest.getUserName(), dbPdfOwner)) {
            return ok(pdfFileService.removeById(pdfId));
        } else if (identity.getRoles().contains(ADMIN_GROUP) && pdfFileService.removeById(pdfId)) {
            return ok(null);
        }
        return unauthorized("Deleting other people PDFs isn't allowed unless you're admin");
    }

    @Path("/update")
    @POST
    @Transactional
    public Response updatePdf(PdfUpdateRequest pdfUpdateRequest) {
        PdfFile pdfFile = pdfUpdateRequest.getPdfFile();

        if (pdfFileService.updatePartial(pdfFile)) {
            return ok(pdfFile,
                    "Sending updated PDF %s back".formatted(pdfFile.getId()));
        }
        return internalError("Failed to update PDF with ID: %s".formatted(pdfFile.getId()));
    }

    @Path("/thumbnail/{id}")
    @POST
    @Transactional
    public Response getThumbnailById(@PathParam("id") int pdfId, BaseRequest baseRequest) throws JsonProcessingException {
        try {
            String cached = cacheManager.get(CacheKeys.PDF_THUMBNAIL.formatted(pdfId));
            if (cached != null) {
                byte[] cachedThumbnail = Base64.getDecoder().decode(cached);
                logger.debug("Sending cached thumbnail for {}", pdfId);
                return okImage("Send thumbnail back to client", cachedThumbnail);
            }
        } catch (Exception ignored) {
            logger.info("Getting thumbnail from db for {}", pdfId);
        }

        byte[] thumbnailBytes = pdfFileService.getThumbnailById(pdfId);
        cacheManager.put(CacheKeys.PDF_THUMBNAIL.formatted(pdfId), Base64.getEncoder().encodeToString(thumbnailBytes));
        logger.debug("Sending thumbnail for {}", pdfId);
        return okImage("Send thumbnail back to client", thumbnailBytes);
    }

    @Path("/get/{id}")
    @POST
    @Transactional
    public Response getPdfById(@PathParam("id") int pdfId, BaseRequest baseRequest) {
        PdfFile pdfFile = pdfFileService.getById(pdfId);
        if (pdfFile == null) {
            return notFound("PDF not found %s".formatted(pdfId));
        }
        return okPdf("Sending PDF back to client", pdfFile.getFileName(), pdfFile.getData());
    }

}
