// import from "@google-cloud/storage";

import { Storage } from "@google-cloud/storage";

const storage = new Storage({
    keyFilename: process.env.KEY_FILE_NAME,
    projectId: process.env.PROJECT_ID,
});

export default storage;
