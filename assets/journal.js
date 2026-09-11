(() => {
  "use strict";

  const listing = document.querySelector(".quarto-listing .list");
  const emptyState = document.querySelector("[data-journal-empty]");
  if (!listing || !emptyState || listing.children.length > 0) return;

  // List.js expects a template item even when Quarto has no public posts. Give
  // it a hidden one for initialization, then discard it once the page is ready.
  const placeholder = document.createElement("div");
  placeholder.className = "journal-list-placeholder";
  placeholder.hidden = true;
  placeholder.dataset.index = "";
  placeholder.dataset.categories = "";
  placeholder.dataset.listingDateSort = "";
  placeholder.dataset.listingFileModifiedSort = "";
  placeholder.innerHTML = '<span class="listing-categories"></span>';
  listing.append(placeholder);

  document.body.classList.add("journal-is-empty");
  emptyState.hidden = false;

  const main = document.querySelector("main.content");
  if (main) {
    main.classList.remove("column-page-left");
    main.classList.add("column-page");
  }

  window.addEventListener("DOMContentLoaded", () => placeholder.remove(), { once: true });
})();
