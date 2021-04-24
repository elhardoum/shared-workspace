(() =>
{
  document.querySelectorAll('.end-lease').forEach(del =>
  {
    del.addEventListener('click', e =>
    {
      e.preventDefault()

      if ( ! confirm('Are you sure you want to end this lease?') )
        return

      fetch('/my-rentals', {
        method: 'DELETE',
        headers: {
          'content-type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({ id: del.dataset.id })
      }).then(res => res.json())
        .then(data =>
        {
          if ( data.success )
            return location.reload()

          if ( ! (data.errors||[]).length )
            return alert('Unknown error occurred, please try again.')

          const errors = data.errors.map(err => err.error).join('\n')
          errors && alert(errors) 
        })
        .catch(err =>
        {
          alert(`Error occurred, ${err}`)
        })
    }, false)
  })
})()
