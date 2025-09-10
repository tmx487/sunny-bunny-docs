import GithubSlugger from 'github-slugger'

const slugger = new GithubSlugger()

export function slugifyFilePath(fp: string): string {
  return slugger.slug(fp, true) // true для сохранения Unicode
}