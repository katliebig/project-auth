import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch, batch } from 'react-redux'
import { useHistory } from 'react-router-dom'

import secrets from '../reducers/secrets'
import user from '../reducers/user'

import { API_URL } from '../reusable/urls'

const Main = () => {
  const [newSecret, setNewSecret] = useState('')
  const accessToken = useSelector(store => store.user.accessToken)
  const secretItems = useSelector(store => store.secrets.items)

  const history = useHistory()
  const dispatch = useDispatch()

  useEffect(() => {
    if (!accessToken) {
      history.push('/login')
    }
  }, [accessToken, history])

  useEffect(() => {
    const config = {
      method: 'GET',
      headers: {
        'Authorization': accessToken
      }
    }

    fetch(API_URL('secrets'), config)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          batch(() => {
            dispatch(secrets.actions.setSecrets(data.secrets))
            dispatch(secrets.actions.setErrors(null))
          })
        } else {
          dispatch(secrets.actions.setErrors(data))
        }
      })
  }, [accessToken, dispatch])

  const onLogoutButtonClick = () => {
    batch(() => {
      dispatch(user.actions.setUsername(null))
      dispatch(user.actions.setAccessToken(null))
      dispatch(secrets.actions.setSecrets([]))
    })
    localStorage.removeItem("user")
  }

  const onSecretSubmit = (e) => {
    e.preventDefault()

    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accessToken
      },
      body: JSON.stringify({ message: newSecret })
    }
    fetch(API_URL("secrets"), config)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          dispatch(secrets.actions.addNewSecret(data.newSecret))
        } else {
          dispatch(secrets.actions.setErrors(data))
        }
      })
    setNewSecret('')
  }

  return (
    <div className="path-container">
      <div className="main-container">
        <button onClick={onLogoutButtonClick} className="logout-button">
          Log out
      </button>
        <form>
          <label>What's your secret?</label>
          <input
            type="text"
            value={newSecret}
            onChange={(e) => setNewSecret(e.target.value)}
          />
          <button onClick={onSecretSubmit} className="submit-button">Share your secret</button>
        </form>
        <p>Hover on each box to unveil the secret!</p>
        <div className="secret-container">
          {secretItems.map(secret => (
            <div key={secret._id} className="secret">{secret.message}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
export default Main
