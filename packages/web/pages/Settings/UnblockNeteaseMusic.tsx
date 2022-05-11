const UnblockNeteaseMusic = () => {
  return (
    <div>
      <div className='text-xl font-medium text-gray-800 dark:text-white/70'>
        UnblockNeteaseMusic
      </div>
      <div className='mt-3 h-px w-full bg-black/5 dark:bg-white/10'></div>

      <div>
        音源:
        <div>
          <input type='checkbox' id='migu' value='migu' />
          <label htmlFor='migu'>migu</label>
        </div>
        <div>
          <input type='checkbox' id='youtube' value='youtube' />
          <label htmlFor='youtube'>youtube</label>
        </div>
        <div>
          <input type='checkbox' id='kugou' value='kugou' />
          <label htmlFor='kugou'>kugou</label>
        </div>
        <div>
          <input type='checkbox' id='kuwo' value='kuwo' />
          <label htmlFor='kuwo'>kuwo</label>
        </div>
        <div>
          <input type='checkbox' id='qq' value='qq' />
          <label htmlFor='qq'>qq</label>
        </div>
        <div>
          <input type='checkbox' id='bilibili' value='bilibili' />
          <label htmlFor='bilibili'>bilibili</label>
        </div>
        <div>
          <input type='checkbox' id='joox' value='joox' />
          <label htmlFor='joox'>joox</label>
        </div>
      </div>
    </div>
  )
}

export default UnblockNeteaseMusic
