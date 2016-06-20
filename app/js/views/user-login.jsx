import React from 'components/react';

export default class UserLogin extends React.Component {
  render() {
    return (
      <form className="user-login">
        <input placeholder="Family name" className="user-login__name-field"/>
        <button className="user-login__login-button">
          <img src="css/icons/next.svg"/>
        </button>
      </form>
    );
  }
}
