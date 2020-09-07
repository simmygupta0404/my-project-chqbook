import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import './DataTable.scss';

class DataTableRowItem extends React.PureComponent {
  render() {
    const { children, className } = this.props;
    return <div className={cx("TableRowItem", className)}>{children}</div>;
  }
}

DataTableRowItem.propTypes = {
  className: PropTypes.string,
};
DataTableRowItem.defaultProps = {
  className: '',
};

export default DataTableRowItem;
