import template from './sw-plugin-file-upload.html.twig';
import './sw-plugin-file-upload.scss';
import pluginErrorHandler from '../../service/plugin-error-handler.service';

const { Component, Mixin } = Shopware;

Component.register('sw-plugin-file-upload', {
    template,

    inject: ['pluginService'],

    mixins: [
        Mixin.getByName('notification')
    ],

    methods: {
        onClickUpload() {
            this.$refs.fileInput.click();
        },

        onFileInputChange() {
            const newFiles = Array.from(this.$refs.fileInput.files);
            this.handleUpload(newFiles);
            this.$refs.fileForm.reset();
        },

        handleUpload(files) {
            const formData = new FormData();
            formData.append('file', files[0]);

            return this.pluginService.upload(formData).then(() => {
                return this.createNotificationSuccess({
                    title: this.$tc('sw-plugin.fileUpload.titleUploadSuccess'),
                    message: this.$tc('sw-plugin.fileUpload.messageUploadSuccess')
                });
            }).catch((exception) => {
                const mappedErrors = pluginErrorHandler.mapErrors(exception.response.data.errors);
                mappedErrors.forEach((error) => {
                    if (error.parameters) {
                        this.showStoreError(error);
                        return;
                    }

                    this.createNotificationError({
                        title: this.$tc(error.title),
                        message: this.$tc(error.message)
                    });
                });
            });
        },

        showStoreError(error) {
            const docLink = this.$tc('sw-plugin.errors.messageToTheShopwareDocumentation', 0, error.parameters);
            this.createNotificationError({
                title: error.title,
                message: `${error.message} ${docLink}`,
                autoClose: false
            });
        }
    }
});
