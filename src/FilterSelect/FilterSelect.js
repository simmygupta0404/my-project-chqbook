import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import "./FilterSelect.scss";



export function isValidValue(val) {
    return val !== undefined && val !== null && val !== "null" && val !== "";
}

export function noop(){}

class FilterSelect extends PureComponent {
    constructor() {
        super();

        this.state = {
            isOpen: false
        };
    }
    componentDidMount() {
        document.addEventListener("click", this.openOptionDropdown);
    }
    componentWillUnmount() {
        document.removeEventListener("click", this.openOptionDropdown);
    }
    onOptionSelect = event => {
        const selectedIndex = event.currentTarget.dataset.index;

        this.props.onChange(this.props.options[selectedIndex]);

        setTimeout(() => {
            this.setState({
                isOpen: false
            })
        })
    }
    openOptionDropdown = event => {
        this.setState({
            isOpen: this.refs.triggerRef.contains(event.target)
        })
    }
    render() {
        const selected = isValidValue(this.props.value) && this.props.options.find(opt => opt.value === this.props.value);
        return <div className={cx("FilterSelect", {
            "showOverlay": this.state.isOpen
        })}>
            <div className="FilterSelect__content" ref="triggerRef">
                <div className="FilterSelect__trigger">
                    <label>{this.props.label}</label>
                    <span>{(selected && selected.label) || this.props.placeholder}</span>
                    <i className="fa-icon-chevron-left" />
                </div>
                <div className={cx("FilterSelect__options", {
                    "hide": !this.state.isOpen
                })}>
                    {this.props.options.length > 0 ? 
                        this.props.options.map((opt, i) => {
                            return <div
                                key={i}
                                data-index={i}
                                onClick={this.onOptionSelect}
                                className={cx("FilterSelect__options__option", {
                                    "selected": opt.value === this.props.value
                                })}
                            >
                                {opt.label || opt.value.toString()}
                            </div>
                        })
                    :
                        <p className="no-data-msg">No options found</p>
                    }
                </div>
            </div>
        </div>
    }
}

FilterSelect.propTypes = {
    label: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.any
    })),
    value: PropTypes.any,
    placeholder: PropTypes.string,
    onChange: PropTypes.func
};

FilterSelect.defaultProps = {
    placeholder: "Select",
    onChange: noop,
    options: []
}

export default FilterSelect;