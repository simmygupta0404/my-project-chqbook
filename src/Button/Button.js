import React, { Component } from 'react';
import cx from 'classnames';
import './Button.scss';

class Button extends Component {
  handleClick = evt => {
    evt.persist();
    if (this.props.onClick) this.props.onClick(evt);
  };
  render() {
    const { width, padding } = this.props;
    const classNames = {
      "isPrimary": this.props.btnStyle === 'primary',
      "isSecondary": this.props.btnStyle === 'secondary',
      "isTertiary": this.props.btnStyle === 'tertiary',
      "isQuaternary": this.props.btnStyle === 'quaternary',
      "isLarge": this.props.size === 'large',
      "isMedium": this.props.size === 'medium',
      "isfull": this.props.size === 'full',
      "isActive": this.props.active,
      // "isSearchBtn": this.props.isSearchBtn,
    };

    const style = {
      width: width || null,
      padding: padding || null,
    };
    return (
      <button
        className={cx("btn", classNames,this.props.className)}
        onClick={this.handleClick}
        disabled={this.props.disabled}
        style={style}
        type={this.props.type}
      >
        {this.props.children}
      </button>
    );
  }
}



Button.defaultProps = {
  btnStyle: 'primary',
  size: 'medium',
  onClick: null,
  active: false,
  disabled: false,
  isSearchBtn: false,
  children: null,
  width: 'auto',
  padding: '',
  type: "button"
};

export default Button;
