FROM node:18
WORKDIR /usr/app
COPY package*.json ./
RUN npm install

# Set environment variables
ENV KEY_FILE_NAME="./service-key.json"
ENV DATABASE_URL="mysql://root:bangkit-mysql-db-password@34.101.124.227:3306/public"

ENV GCLOUD_STORAGE_URL="https://storage.googleapis.com"
ENV GCLOUD_STORAGE_BUCKET_NAME="bangkit-bucket-capstone"

ENV JWT_SECRET="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
ENV JWT_ACCESS_EXPIRATION_MINUTES=30
ENV JWT_REFRESH_EXPIRATION_DAYS=30
ENV JWT_RESET_PASSWORD_EXPIRATION_MINUTES=10
ENV JWT_VERIFY_EMAIL_EXPIRATION_MINUTES=10

ENV SERVER_URL="http://localhost:3000"
ENV EMAIL_FROM="adellinekaniasetiyawan@gmail.com"
ENV EMAIL_PASSWORD="yjrb fdqe uzuo pngp"

ENV PORT=4000

# Copy the Prisma folder with the schema.prisma file
COPY prisma/ prisma/

# Generate the Prisma client
RUN npx prisma generate

# Deploy existing migrations
RUN npx prisma migrate deploy

COPY . .

EXPOSE 4000

CMD ["npm", "start"]