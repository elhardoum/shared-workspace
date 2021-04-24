(() =>
{
  const form = document.getElementById('new-property-form')

  form.addEventListener('submit', e =>
  {
    e.preventDefault()

    const loading = form.querySelector('.ajax-loader')

    // loading image visible
    if ( ! loading.classList.contains('hidden') )
      return

    const categoryid = Number(document.getElementById('categoryid').value)
        , title = document.getElementById('title').value.trim()
        , capacity = Number(document.getElementById('capacity').value)
        , available = document.getElementById('available').value.trim()
        , term = document.getElementById('term').value.trim()
        , price = document.getElementById('price').value.trim()
        , smoking = document.getElementById('smoking').checked
        , remove_tenant = (document.getElementById('remove_tenant')||{}).checked
        , listed = document.getElementById('listed').checked

    loading.classList.remove('hidden')

    fetch(location.pathname, {
      method: /\d+\/workspaces\/\d+/.test(location.pathname) ? 'PATCH' : 'PUT',
      headers: {
        'content-type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({ categoryid, title, capacity, available, term, price, smoking, remove_tenant, listed })
    }).then(res => res.json())
      .then(data =>
      {
        loading.classList.add('hidden')

        if ( data.success )
          return location.assign(location.pathname.replace(/(\/workspaces)\/.+/, '$1'))

        if ( ! (data.errors||[]).length )
          return alert('Unknown error occurred, please try again.')

        data.errors.filter(err => !!err.field).forEach(err =>
        {
          form.querySelector(err.field).classList.add('border-red')
          form.querySelector(`[data-error-field="${err.field}"]`).textContent = err.error
        })

        const errors = data.errors.filter(err => ! err.field).map(err => err.error).join('\n')
        errors && alert(errors) 
      })
      .catch(err =>
      {
        loading.classList.add('hidden')
        alert(`Error occurred, ${err}`)
      })
  })

  form.querySelectorAll('input[id],select[id]').forEach(field => field.addEventListener('change', e =>
  {
    field.classList.remove('border-red')
    try {
      form.querySelector(`[data-error-field="#${field.id}"]`).textContent = ''
    } catch(err) {}
  }))
})()