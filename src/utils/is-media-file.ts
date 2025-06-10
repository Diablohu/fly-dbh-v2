const isMediaFile = (file: File) => {
    return /^(video|audio)/.test(file.type || "") || /\.flv$/.test(file.name);
};

export default isMediaFile;
