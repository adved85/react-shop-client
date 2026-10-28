const TableMessageRow = ({ children, colSpan = 6 }) => {
    return (
        <tr>
            <td colSpan={colSpan}>{children}</td>
        </tr>
    )
};

export default TableMessageRow;
