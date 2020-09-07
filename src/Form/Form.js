import React, { Component } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import { clone } from "ramda";
import Button from "../Button/Button";
import "./Form.scss";
import { noop } from "../FilterSelect/FilterSelect";
import Select from "../Select/Select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";





export function createDebounce(func, wait = 200, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};
export function isValidValue(val) {
    return val !== undefined && val !== null && val !== "null" && val !== "";
}

export function getFormFields(formFieldsConfig) {
    const formFields = [];

    formFieldsConfig.forEach(config => {
        if(config.subFields && Array.isArray(config.subFields) && config.subFields.length) {
            const subFields = getFormFields(config.subFields);
            Array.prototype.push.apply(formFields, subFields);
            return;
        }
        
        formFields.push(config);
    });

    return formFields;
}

export function removeFormField(formFieldsConfig, fieldName) {
    return formFieldsConfig.some((config, i) => {
        if(config.subFields && Array.isArray(config.subFields) && config.subFields.length) {
            return removeFormField(config.subFields, fieldName);
        }
        
        if(config.name === fieldName) {
            formFieldsConfig.splice(i, 1);
            return true;
        }

        return false;
    });
}

export function validateAllFields(formConfig, formState) {
    const formFields = getFormFields(formConfig);
    const formFieldsMap = {};
    const errors = {};

    formFields.forEach(field => {
        formFieldsMap[field.name] = field;
    });
    
    formFields.forEach(field => {
        const isValid = validateField(field, formState[field.name], formFieldsMap, formState);

        if(typeof isValid === "string") {
            errors[field.name] = isValid;
        }
    });

    if(Object.keys(errors).length === 0) {
        return true;
    }
    
    return errors;
}

export function validateField(field, value, formFieldsMap, formState) {
    if(!field.validations) {
        return true;
    }
    if(field.validations.required) {
        if(!isValidValue(value) || (typeof value === "string" &&  value.trim()==="") || (field.type === "file" && value.length === 0)) {
            return "This field is required";
        }
    }
    if(field.validations.isNumber && isNaN(value)) {
        return "Please enter valid numeric value";
    }
    return true;
}


function prepareInitialState(fields) {
    const formState = {};
    getFormFields(fields).forEach(field => {
        formState[field.name] = field.defaultValue
    });
    return formState;
}

function prepareVisibleFields(fields, formState) {
    const visibleFields = {};
    fields.forEach(field => {
        if (field.subFields) {
            const temp = prepareVisibleFields(field.subFields, formState);
            Object.assign(visibleFields, temp);
            return;
        }
        if (field.name) {
            visibleFields[field.name] = true;
            if (typeof field.dependencyField === "string") {
                if (field.hasOwnProperty("dependencyValue")) {
                    if (field.dependencyValue.indexOf(formState[field.dependencyField]) === -1) {
                        visibleFields[field.name] = false;
                    }
                    return;
                }
                if (!isValidValue(formState[field.dependencyField])) {
                    visibleFields[field.name] = false;
                }
            } else if (Array.isArray(field.dependencyField) && field.dependencyField.length > 0) {
                const valid = field.dependencyField.every(dependencyField => isValidValue(formState[dependencyField]))
                if (!valid) {
                    visibleFields[field.name] = false;
                }
            }
        }
    });
    return visibleFields;
}

function resetDependentFieldState(field, formFields, formState, dependencyMap) {
    if (!dependencyMap) {
        dependencyMap = {};
        formFields.forEach(formField => {
            if (formField.dependencyField) {
                if (dependencyMap[formField.dependencyField]) {
                    dependencyMap[formField.dependencyField].push(formField);
                } else {
                    dependencyMap[formField.dependencyField] = [formField];
                }
            }
        });
    }

    if (dependencyMap[field.name]) {
        dependencyMap[field.name].forEach(dependentField => {
            formState[dependentField.name] = dependentField.defaultValue || "";
            resetDependentFieldState(dependentField, formFields, formState, dependencyMap);
        })
    }

    return formState;
}

class Form extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formState: prepareInitialState(props.formConfig),
            formFields: props.formConfig,
            errors: {},
            active: false
        }

        this.visibleFields = prepareVisibleFields(this.state.formFields, this.state.formState);

        this.fileUploadRefs = [];
        this.fileUploadIconRefs = [];
    }
    onChangeDebounced = createDebounce((field, value, formState) => {
        this.props.onChange(field, value, formState);
    }, 400)
    renderFields = (formFields) => {
        return formFields.map((field, i) => {
            if (this.visibleFields[field.name] === false || field.type === "hidden") {
                return null;
            }

            if (field.subFields && Array.isArray(field.subFields) && field.subFields.length) {
                return <div className={cx(field.className, { "field-row": field.layout === "columns" })} key={i}>
                    {this.renderFields(field.subFields)}
                </div>
            }

            return <div className="field-wrap" key={field.name || i}>
                <div className={`floating-form-field ${this.state.errors[field.name] && `error`} ${field.cssClassName}`}>
                    {this.getField(field)}
                    {Array.isArray(field.hints) &&
                        <div className="field-hints">
                            {field.hints.map(hintText => {
                                return <p key={hintText}>{hintText}</p>
                            })}
                        </div>
                    }
                </div>
            </div>
        });
    }
    files = (field, files) => {
        if (files.length) {
            const formState = clone(this.state.formState);
            formState[field.name] = files;
            this.setState({
                formState
            });
            if (this.props.callOnChangeOnFileSelect) this.onChange(field, files);
        }
        else {
            this.onChange(field, files)
        }

    }
    getField = (field) => {    
        const value = this.state.formState[field.name];   
        switch (field.type) {
            case "display":
                let val = value;
                if (field.calculate) {
                    /* eslint-disable no-new-func */
                    const calcFn = new Function("formState", field.calculate);
                    val = calcFn(this.state.formState);
                }
                return <span>{val}</span>
            case "render":
                return field.defaultValue;
            case "text":
            case "email":      
                return <React.Fragment>
                    <input
                        type={field.type}
                        onChange={this.onFieldChange.bind(null, field)}
                        onClick={this.onFieldActive.bind(null, field)}
                        value={value}
                        disabled={field.disabled}
                    />
                    <label className={cx("form-field-label", {
                        'with-placeholder': !isValidValue(value),
                        'without-placeholder': isValidValue(value)
                    })}
                        htmlFor={field.name}>{this.state.errors[field.name] ? this.state.errors[field.name] : field.label}</label>
                </React.Fragment>
            case "number":
                const props = {};
                if (field.validations && isValidValue(field.validations.minNumber)) {
                    props.min = field.validations.minNumber;
                }
                if (field.validations && isValidValue(field.validations.maxNumber)) {
                    props.max = field.validations.maxNumber;
                }
                return <React.Fragment>
                    <input
                        onClick={this.onFieldActive.bind(null, field)}
                        type="number"
                        onChange={this.onNumberChange.bind(null, field)}
                        value={value}
                        {...props}
                    />
                    <label className={`form-field-label ${field.active && `active`}`} htmlFor={field.name}>{this.state.errors[field.name] ? this.state.errors[field.name] : field.label}</label>
                </React.Fragment>
            case "select":
                return <React.Fragment>
                    <Select
                        data={field.options}
                        selectedOption={value}
                        onSelectChange={this.onChangeSelect.bind(null, field)}
                        placeholder={field.placeholder}
                        isDisabled={field.disabled}
                    />
                    <label className={`form-field-label select-label ${isValidValue(value) && 'shift'}`} htmlFor={field.name}>{this.state.errors[field.name] ? this.state.errors[field.name] : field.label}</label>
                </React.Fragment>
            case "datepicker":
                return <React.Fragment>
                    <DatePicker
                        selected={new Date(value)}
                        onSelect={this.onDateChange.bind(null, field)}
                        startOpen={true}
                    />
                    <label className={`form-field-label ${field.active && `active`}`} htmlFor={field.name}>{this.state.errors[field.name] ? this.state.errors[field.name] : field.label}</label>
                </React.Fragment>
            case "textarea":
                return <React.Fragment>
                    <textarea rows={field.row}
                        name={field.name}
                        value={value}
                        onChange={this.onFieldChange.bind(null, field)}>
                    </textarea>
                    <label className="form-field-label" htmlFor={field.name}>{this.state.errors[field.name] ? this.state.errors[field.name] : field.label}</label>
                </React.Fragment>
            case "input-text":
                return <React.Fragment>
                    <input
                        className={field.type}
                        onChange={this.onFieldChange.bind(null, field)}
                        onClick={this.onFieldActive.bind(null, field)}
                        value={value}
                        disabled={field.disabled}
                    />
                    <span class="input-text-field" onClick={this.apiCall.bind(null, field)}>{field.inputBtnText}</span>
                    <label className={cx("form-field-label", {
                        'with-placeholder': !isValidValue(value),
                        'without-placeholder': isValidValue(value)
                    })}
                        htmlFor={field.name}>{this.state.errors[field.name] ? this.state.errors[field.name] : field.label}</label>
                </React.Fragment>
            default:
                return null;
        }
    }
    setFileUploadRef = (ref) => {
        this.fileUploadRefs.push(ref);
    }
    setFileUploadIconRef = (ref) => {
        this.fileUploadIconRefs.push(ref);
    }
    apiCall = (field) => {
        let func = field.inputCall;
        typeof func === 'function' ? func() : noop();
    }
    onNumberChange = (field, event) => {
        const value = event.target.value;

        if (!field.hasOwnProperty("validations") ||
            (
                (!field.validations.hasOwnProperty("minNumber") || (isValidValue(field.validations.minNumber) && value >= field.validations.minNumber))
                &&
                (!field.validations.hasOwnProperty("maxNumber") || (isValidValue(field.validations.maxNumber) && value <= field.validations.maxNumber))
            )
        ) {
            this.onChange(field, value);
        }
    }
    onDateChange = (field, value) => {
        this.onChange(field, value);
    }
    onChangeSelect = (field, selectedOption) => {
        if (field.isMulti) {
            let selectedOptions = []
            selectedOption && selectedOption.map(item => {
                return selectedOptions.push(item)
            })
            this.onChange(field, selectedOptions);
        }
        else {
            this.onChange(field, selectedOption.value ? selectedOption.value : selectedOption);
        }

    }
    onCheckboxChange = (field, event) => {
        this.onChange(field, event.target.checked);
    }
    onCheckboxChange = (field, event) => {
        this.onChange(field, event.target.checked);
    }
    onFieldChange = (field, event) => {
        this.onChange(field, event.target.value);
    }
    onFieldActive = (field, event) => {
        const formFields = this.props.formConfig;
        getFormFields(formFields).filter(item => item.name === field.name)[0]["active"] = true
        this.setState({
            formFields
        }, () => {
            this.onChangeDebounced(field, this.state.formState);
        });
    }
    onChange = (field, value) => {
        const formState = clone(this.state.formState);
        formState[field.name] = value;

        // Reset dependent fields
        resetDependentFieldState(field, this.state.formFields, formState);
        this.visibleFields = prepareVisibleFields(this.state.formFields, formState);

        this.setState({
            formState
        }, () => {
            this.onChangeDebounced(field, value, this.state.formState);
        });
    }
    btnclick = (btnConfig) => {
        if ((btnConfig && btnConfig.validation) || (btnConfig.name !== "cancel")) {
            const visibleFields = getFormFields(this.state.formFields).filter(field => this.visibleFields[field.name]);
            const isFormValid = validateAllFields(visibleFields, this.state.formState);
            if (typeof isFormValid === "object") {
                this.setState({
                    errors: isFormValid
                });
                return;
            } else {
                this.setState({
                    errors: {}
                })
                if (btnConfig === "submit" || btnConfig.name === "save") {
                    this.props.onSubmit(this.state.formState, btnConfig)
                }
                else {
                    (this.props.onReject && btnConfig === "reject") && this.props.onReject(this.state.formState, btnConfig)
                }
            }
        }
        else {
            this.props.onSubmit(this.state.formState, btnConfig);
        }
    }
    getFormValues = () => {
        const visibleFields = getFormFields(this.state.formFields).filter(field => this.visibleFields[field.name]);
        const isFormValid = validateAllFields(visibleFields, this.state.formState);
        if (typeof isFormValid === "object") {
            this.setState({
                errors: isFormValid
            });
            return false;
        } else {
            this.setState({
                errors: {}
            })
            return this.state.formState
        }
    }
    updateFormState = newState => {
        this.setState({
            formState: {
                ...this.state.formState,
                ...newState
            }
        })
    }
    updateFieldsConfig = (newFormFields) => {
        this.visibleFields = prepareVisibleFields(newFormFields, this.state.formState)
        this.setState({
            formFields: newFormFields
        });
    }
    resetForm = () => {
        const props = this.props;
        const formFields = props.formConfig;
        const formState = prepareInitialState(props.formConfig);
        this.setState({
            formState,
            formFields,
            errors: {}
        });
        this.visibleFields = prepareVisibleFields(formFields, formState);

        this.fileUploadRefs.forEach(ref => ref.resetField());
        this.fileUploadIconRefs.forEach(ref => {
            if (ref) {
                ref.resetField()
            }
        });
    }
    render() {
        return <div className={cx("form-wrap", this.props.className)}>
            {this.renderFields(this.state.formFields)}
            {(this.props.btnConfig && this.props.btnConfig.length > 1 ?
                <div className="btn-grp">
                    {this.props.btnConfig.map((field, i) => {
                        return <Button key={i}
                            btnStyle={field.btnStyle}
                            disabled={field.disabled}
                            onClick={this.btnclick.bind(null, field)}
                            className={field.className} >
                            {
                                <React.Fragment>
                                    {field.iconSrc && <img src={field.iconSrc} alt="" />}
                                    {field.text}
                                </React.Fragment>
                            }</Button>
                    })}
                </div>
                :
                <div className="top-spacing">

                    {this.props.btnConfig && this.props.btnConfig.map((field, i) => {
                        return <Button key={i}
                            btnStyle={field.btnStyle}
                            onClick={this.btnclick.bind(null, field)}
                            disabled={field.disabled}
                            className={field.className}
                            width={field.width}>
                            {
                                <React.Fragment>
                                    {field.iconSrc && <img src={field.iconSrc} alt="" />}
                                    {field.text}
                                </React.Fragment >
                            }
                        </Button>
                    })}
                </div>
            )}
        </div>
    }
}

Form.propTypes = {
    formConfig: PropTypes.arrayOf(PropTypes.object).isRequired,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    onReject: PropTypes.func,
    submitLabel: PropTypes.string,
    rejectLabel: PropTypes.string,
    className: PropTypes.string,
    callOnChangeOnFileSelect: PropTypes.bool
};

Form.defaultProps = {
    submitLabel: "Submit",
    className: "",
    onChange: () => { },
    callOnChangeOnFileSelect: false
};

export default Form;
