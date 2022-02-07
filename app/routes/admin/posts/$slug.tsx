import {Form, redirect, useActionData, useLoaderData, useTransition} from 'remix'
import type { ActionFunction, LoaderFunction } from 'remix'
import invariant from 'tiny-invariant'

import { createPost, getPost } from '~/post'

type PostError = {
    title?: boolean
    slug?: boolean
    markdown?: boolean
}

export const loader: LoaderFunction = ({params}) => {
    const { slug } = params
    invariant(slug, 'Expected params.slug')
    return getPost(slug)
}

export const action: ActionFunction = async ({request}) => {
    await new Promise(res => setTimeout(res, 1000))

    const formData = await request.formData()

    const title = formData.get('title')
    const slug = formData.get('slug')
    const markdown = formData.get('markdown')

    const errors: PostError = {}
    if (!title) errors.title = true
    if (!slug) errors.slug = true
    if (!markdown) errors.markdown = true

    if (Object.keys(errors).length > 0) {
        return errors
    }

    invariant(typeof title === 'string')
    invariant(typeof slug === 'string')
    invariant(typeof markdown === 'string')

    createPost({title, slug, markdown})

    return redirect('/admin')
}

export default function EditPost() {
    const post = useLoaderData()
    const errors = useActionData()
    const transition = useTransition()

    return (
        <Form method={'post'}>
            <p>
                <label>
                    Post Title: { errors?.title ? <em>Title is required</em> : null} <input type={'text'} name={'title'} defaultValue={post.title}/>
                </label>
            </p>
            <p>
                <label>
                    Post Slug: { errors?.slug ? <em>Slug is required</em> : null} <input type={'text'} name={'slug'} defaultValue={post.slug}/>
                </label>
            </p>
            <p>
                <label htmlFor={'markdown'}>Markdown:</label>
                { errors?.markdown ? <em>Markdown is required</em> : null}
                <br/>
                <textarea key={post.slug} id={'markdown'} rows={20} name={'markdown'} defaultValue={post.markdown}/>
            </p>
            <p>
                <button type={'submit'}>{transition.submission ? 'Creating' : 'Create Post'}</button>
            </p>
        </Form>
    )
}
