import { pool } from '..'

async function run() {

  const p = pool('./worker.js')

  const res = await p.exec('add', [2, 3])

  const b = res +2

}
