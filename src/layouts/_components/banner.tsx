import styles from "./banner.module.less";

// ============================================================================

const Banner = () => {
    return (
        <section className={styles["banner"]}>
            <div className={styles["wrapper"]}>BANNER</div>
            <div className={styles["intersection-check"]}></div>
        </section>
    );
};

export default Banner;
