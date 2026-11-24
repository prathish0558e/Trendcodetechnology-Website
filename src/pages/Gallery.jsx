import { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { PageHero, Reveal, SectionHead } from "../components/Reveal.jsx";
import { getGallery } from "../api.js";

const DEFAULT_CATEGORIES = ["All", "Office", "Team", "Events", "Workspace", "Celebrations", "Achievements"];

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    let mounted = true;
    getGallery()
      .then((data) => {
        if (mounted) {
          setPhotos(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || "Failed to load photos.");
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Compute available categories dynamically
  const categories = useMemo(() => {
    const set = new Set(["All"]);
    for (const p of photos) {
      if (p.category) set.add(p.category.trim());
    }
    for (const c of DEFAULT_CATEGORIES) {
      set.add(c);
    }
    return Array.from(set);
  }, [photos]);

  // Filtered photos based on active category
  const filteredPhotos = useMemo(() => {
    if (activeCategory === "All") return photos;
    return photos.filter(
      (p) => (p.category || "").toLowerCase() === activeCategory.toLowerCase()
    );
  }, [photos, activeCategory]);

  // Keyboard navigation for Lightbox
  const handleKeyDown = useCallback(
    (e) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev > 0 ? prev - 1 : filteredPhotos.length - 1));
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev < filteredPhotos.length - 1 ? prev + 1 : 0));
      }
    },
    [lightboxIndex, filteredPhotos.length]
  );

  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxIndex, handleKeyDown]);

  const activePhoto = lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  return (
    <>
      <PageHero
        eyebrow="TCT Life & Moments"
        title="Photo Gallery"
        text="A visual journey through Trend Code Technology — our innovation labs, team culture, project milestones, hackathons, and celebrations in Coimbatore."
        crumb="Gallery"
      />

      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="Moments Captured"
            title="Explore Life at Trend Code Technology"
            subtitle="Discover the faces, passion, and collaborative energy that drive our digital creations every single day."
          />

          {/* Filter Bar */}
          <div className="gallery-tabs-wrap">
            <div className="tech-tabs" role="tablist">
              {categories.map((cat) => (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={activeCategory === cat}
                  className={`tech-tab ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => {
                    setActiveCategory(cat);
                    setLightboxIndex(null);
                  }}
                >
                  {cat === "All" ? "All Photos" : cat}
                  {cat !== "All" && (
                    <span className="admin-count" style={{ marginLeft: 6, fontSize: "0.75rem" }}>
                      {photos.filter((p) => (p.category || "").toLowerCase() === cat.toLowerCase()).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Loading and Error states */}
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
              <div className="spinner-border text-primary" role="status" style={{ width: "2.5rem", height: "2.5rem", marginBottom: 16 }}></div>
              <p>Loading photo gallery...</p>
            </div>
          )}

          {error && (
            <div className="banner err" style={{ maxWidth: 600, margin: "20px auto" }}>
              <i className="bi bi-exclamation-triangle me-2"></i> {error}
            </div>
          )}

          {/* Photos Grid */}
          {!loading && filteredPhotos.length === 0 && (
            <div className="gallery-empty">
              <i className="bi bi-camera" style={{ fontSize: "3rem", color: "#cbd5e1" }}></i>
              <h3>No photos found in "{activeCategory}"</h3>
              <p>Check other categories or check back soon as our team posts new updates.</p>
              <button className="btn btn-outline btn-sm" onClick={() => setActiveCategory("All")}>
                View All Photos
              </button>
            </div>
          )}

          {!loading && filteredPhotos.length > 0 && (
            <div className="gallery-grid">
              {filteredPhotos.map((photo, idx) => (
                <Reveal key={photo.id || idx} delay={(idx % 6) * 60}>
                  <div
                    className="gallery-card"
                    onClick={() => setLightboxIndex(idx)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setLightboxIndex(idx);
                      }
                    }}
                    aria-label={`View photo: ${photo.title}`}
                  >
                    <div className="gallery-img-wrap">
                      <img
                        src={photo.imageUrl}
                        alt={photo.title || "TCT Gallery Photo"}
                        loading="lazy"
                        className="gallery-img"
                      />
                      <div className="gallery-overlay">
                        <span className="gallery-zoom-btn">
                          <i className="bi bi-arrows-fullscreen"></i>
                        </span>
                      </div>
                      {photo.category && (
                        <span className="gallery-badge">{photo.category}</span>
                      )}
                    </div>
                    <div className="gallery-info">
                      <div className="gallery-meta">
                        {photo.date && (
                          <span className="gallery-date">
                            <i className="bi bi-calendar3"></i> {photo.date}
                          </span>
                        )}
                      </div>
                      <h3 className="gallery-title">{photo.title}</h3>
                      {photo.description && (
                        <p className="gallery-desc">{photo.description}</p>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && activePhoto && (
        <div
          className="gallery-lightbox"
          onClick={() => setLightboxIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.title}
        >
          <button
            className="gallery-lightbox-close"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close photo preview"
          >
            <i className="bi bi-x-lg"></i>
          </button>

          <button
            className="gallery-lightbox-nav prev"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev > 0 ? prev - 1 : filteredPhotos.length - 1));
            }}
            aria-label="Previous photo"
          >
            <i className="bi bi-chevron-left"></i>
          </button>

          <button
            className="gallery-lightbox-nav next"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev < filteredPhotos.length - 1 ? prev + 1 : 0));
            }}
            aria-label="Next photo"
          >
            <i className="bi bi-chevron-right"></i>
          </button>

          <div className="gallery-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <div className="gallery-lightbox-img-wrap">
              <img
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                className="gallery-lightbox-img"
              />
            </div>
            <div className="gallery-lightbox-caption">
              <div className="gallery-lightbox-header">
                <span className="gallery-badge">{activePhoto.category || "TCT"}</span>
                {activePhoto.date && (
                  <span className="gallery-date" style={{ color: "#94a3b8" }}>
                    <i className="bi bi-calendar3"></i> {activePhoto.date}
                  </span>
                )}
                <span className="gallery-counter">
                  {lightboxIndex + 1} / {filteredPhotos.length}
                </span>
              </div>
              <h2 className="gallery-lightbox-title">{activePhoto.title}</h2>
              {activePhoto.description && (
                <p className="gallery-lightbox-desc">{activePhoto.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Careers / Culture Banner */}
      <section className="section soft">
        <div className="container">
          <Reveal>
            <div className="gallery-cta-card">
              <div className="gallery-cta-text">
                <h2>Want to Experience Life at Trend Code Technology?</h2>
                <p>
                  We are always looking for passionate software developers, designers, AI engineers, and digital innovators to join our team in Ganapathy, Coimbatore.
                </p>
              </div>
              <div className="gallery-cta-actions">
                <Link to="/careers" className="btn btn-primary btn-lg">
                  Explore Careers <i className="bi bi-arrow-right"></i>
                </Link>
                <Link to="/contact" className="btn btn-outline btn-lg">
                  Visit Our Office <i className="bi bi-geo-alt"></i>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
