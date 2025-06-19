const prettifyTitle = (string: string) => {
    return string
        .replace(
            /([^a-z0-9 \:\!\@\#\$\%\^\&\*\(\)：！（）])([a-z0-9]+)/gi,
            "$1 $2 "
        )
        .trim();
};

export default prettifyTitle;
