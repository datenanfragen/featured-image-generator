export const downloadFile = (data_url, filename) => {
    const a = document.createElement('a');
    a.href = data_url;
    a.download = filename;
    a.click();
};
