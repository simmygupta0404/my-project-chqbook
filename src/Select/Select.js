import React, { PureComponent } from 'react';
import memoizeOne from 'memoize-one';
import PropTypes from 'prop-types';
import cx from "classnames";
import './Select.scss';
import { isValidValue } from '../FilterSelect/FilterSelect';


function selectInitialSelectedName(props) {
    if (isValidValue(props.selectedOption)) {
        return props.data.find(item => item.value === props.selectedOption).label;

    }
    return null;
}
class Select extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            dropDown: false,
            selectedTitle: selectInitialSelectedName(props)
        }

    }


    componentDidMount() {
        document.addEventListener('mousedown', this.handleOutsideClick, false);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleOutsideClick, false);
    }

    handleOutsideClick = (e) => {
        if (!this.node.contains(e.target)) {
            this.setState({
                dropDown: false
            })
        }
    }

    onChange = (event) => {
        this.props.onSelectChange(event);
        this.setState({
            selectedTitle: event,
            dropDown: false
        })
    }
    componentDidUpdate(prevProps) {
        if (prevProps.selectedOption !== this.props.selectedOption) {
            this.setState({
                selectedTitle: selectInitialSelectedName(this.props)
            })
        }
    }

    toggleDropDown = () => {
        if (this.props.isDisabled) {
            return;
        }
        this.setState({
            dropDown: !this.state.dropDown
        })

    }


    showTitleSelected = memoizeOne((data, option) => {

        return data.find(item => item.value === option).label
    })

    render() {
        return <div className={cx({ "select-wrapper-disabled": this.props.isDisabled })}>
            <div className={"selectWrap select-wrap-V2"} onClick={this.toggleDropDown}>
                <div className="select-box" ref={node => this.node = node} >
                    <div className="selected-option select-box__option" >
                        <div className="selected select-box__option-selected" onClick={this.toggleDropDown}>
                            {isValidValue(this.state.selectedTitle) &&
                                isValidValue(this.props.selectedOption) &&
                                <div className="option">
                                    <div className="option__text select-box__option-selected-text">
                                        {this.showTitleSelected(this.props.data, this.props.selectedOption)}</div>
                                </div>
                            }
                            <div className="arrow" >
                                <i className="fa-icon-chevron-left" />
                            </div>
                        </div>

                        <div className={cx("select-box__option-list-wrapper", {
                            "hide": !this.state.dropDown
                        })}>
                            <div className="select-box-options-list">

                                {this.props.data && this.props.data.map((item, index) => {
                                    return <div className={`select-box__option-list-wrapper-option ${this.state.selectedTitle === item.label && "selected-option"}`}
                                        key={item.label + ' ' + item.value}
                                        onClick={this.onChange.bind(null, item.value)}
                                    >
                                        {
                                            <span className="checkbox__text"
                                            >{item.label}</span>
                                        }
                                    </div>
                                })}
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    }
}

Select.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })),
    onSelectChange: PropTypes.func.isRequired
}
Select.defaultProps = {
    data: []
};

export default (Select);
