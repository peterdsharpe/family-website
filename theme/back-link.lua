-- Ends every journal post with a link back to the list of posts.
function Pandoc(doc)
  local link = pandoc.Link({ pandoc.Str("All"), pandoc.Space(), pandoc.Str("posts") }, "/blog.html")
  doc.blocks:insert(pandoc.Div({ pandoc.Para({ link }) }, pandoc.Attr("", { "pm-back" })))
  return doc
end
