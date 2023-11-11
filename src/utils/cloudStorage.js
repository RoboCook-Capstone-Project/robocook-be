import storage from "../config/index.js";
import stream from "stream";

async function uploadObject(object, folder = "") {
    return new Promise((resolve, reject) => {
        const bucketName = process.env.GCLOUD_STORAGE_BUCKET_NAME;
        const myBucket = storage.bucket(bucketName);

        // Create a reference to a file object
        const destFileName = folder + Date.now() + object.originalname;
        const file = myBucket.file(destFileName);

        // Create a pass-through stream from a Buffer
        const passthroughStream = new stream.PassThrough();
        passthroughStream.write(object.buffer);
        passthroughStream.end();

        passthroughStream
            .pipe(file.createWriteStream())
            .on("finish", () => {
                const imageUrl = `${process.env.GCLOUD_STORAGE_URL}/${bucketName}/${destFileName}`;
                resolve(imageUrl);
            })
            .on("error", (error) => {
                reject(error);
            });
    });
}

async function uploadObjects(objects, folder = "") {
    // Use Promise.all to upload objects concurrently
    const imageUrls = await Promise.all(
        objects.map(async (file) => {
            const imageUrl = await uploadObject(file, folder);
            return imageUrl;
        })
    );

    return imageUrls;
}

async function deleteObject(fileUrl) {
    return new Promise((resolve, reject) => {
        const bucketName = process.env.GCLOUD_STORAGE_BUCKET_NAME;
        const myBucket = storage.bucket(bucketName);

        // Create a reference to a file object
        const urlParts = fileUrl.split("/");
        const fileName = urlParts.slice(4).join("/");

        const file = myBucket.file(fileName);

        file.delete((err, apiResponse) => {
            if (err) {
                reject(err);
            }
            resolve(apiResponse);
        });
    });
}

async function deleteObjects(fileUrls) {
    // Use Promise.all to delete files concurrently
    const deleteResponses = await Promise.all(
        fileUrls.map(async (fileUrl) => {
            const deleteResponse = await deleteObject(fileUrl);
            return deleteResponse;
        })
    );

    return deleteResponses;
}

export { uploadObject, uploadObjects, deleteObject, deleteObjects };
