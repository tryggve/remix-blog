import path from 'path'
import fs from 'fs'
import parseFrontMatter from 'front-matter'
import invariant from 'tiny-invariant'
import { marked } from 'marked'

type NewPost = {
    title: string
    slug: string
    markdown: string
}

export type Post = {
    slug: string
    title: string
}

export type PostMarkdownAttributes = {
    title: string
}

const postsPath = path.join(__dirname, '..', 'posts')

const isValidPostAttributes = (attributes: any): attributes is PostMarkdownAttributes => {
    return attributes?.title
}

export const getPosts = async () => {
    const dir = fs.readdirSync(postsPath)

    return Promise.all(
        dir.map(async filename => {
            const file = fs.readFileSync(path.join(postsPath, filename))
            const { attributes } = parseFrontMatter(file.toString())

            invariant(isValidPostAttributes(attributes), `${filename} has bad metadata!`)

            return {
                slug: filename.replace(/\.md$/, ''),
                title: attributes.title
            }
        })
    )
}

export const getPost = (slug: string) => {
    const filepath = path.join(postsPath, slug + ".md")
    const file = fs.readFileSync(filepath)
    const { attributes, body } = parseFrontMatter(file.toString())

    invariant(isValidPostAttributes(attributes), `Post ${filepath} is missing attributes`)

    const html = marked(body)

    return {
        slug,
        html,
        markdown: body,
        title: attributes.title
    }
}

export const createPost = (post: NewPost) => {
    const md = `---\ntitle: ${post.title}\n---\n\n${post.markdown}`
    fs.writeFileSync(path.join(postsPath, `${post.slug}.md`), md)
    return getPost(post.slug)
}
