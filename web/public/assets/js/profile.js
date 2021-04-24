(() =>
{
  const form = document.getElementById('profile-form')

  form.addEventListener('submit', e =>
  {
    e.preventDefault()

    const loading = form.querySelector('.ajax-loader')

    // loading image visible
    if ( ! loading.classList.contains('hidden') )
      return

    const name = document.getElementById('name').value.trim()
        , email = document.getElementById('email').value.trim()
        , phone = document.getElementById('phone').value.trim()
        , password = document.getElementById('password').value
        , password2 = document.getElementById('password2').value

    loading.classList.remove('hidden')

    fetch(location.pathname, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({ name, email, phone, password, password2 })
    }).then(res => res.json())
      .then(data =>
      {
        loading.classList.add('hidden')

        if ( data.success )
          return location.assign('/profile')

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
    form.querySelector(`[data-error-field="#${field.id}"]`).textContent = ''
  }))
})()