(() =>
{
  document.querySelectorAll('.pty-delete').forEach(del =>
  {
    del.addEventListener('click', e =>
    {
      e.preventDefault()

      if ( ! confirm('Are you sure you want to delete this property and all child workspaces?') )
        return

      fetch(`/property-admin/edit/${del.dataset.id}`, {
        method: 'DELETE',
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