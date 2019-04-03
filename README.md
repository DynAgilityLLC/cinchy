# cinchy

A React-Hook based Redux API client. Relies on redux-react-hook to provide access to Redux Store.

Example:

```typescript
import React, { useState, useMemo } from 'React';
import { useAPI } from 'cinchy';

const PaginatedTable = (props: any) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [tableData, fetchTableData] = useAPI('/api/table?page={page}', {page: currentPage});
  
  const rows = useMemo(() => tableData.data.map((row, idx) => <tr key={idx}><td>{row.a}</td><td>{row.b}</td><td>{row.c}</td>},[tableData]);
  return (<>
    Data Table
    <table>
      <thead><th><td>A</td><td>B</td><C></td></th></thead>
      <tbody>{rows}</tbody>
    </table>
    <button onClick={() => setCurrentPage(currentPage + 1)}>Next Page<button>
  </>)
};
```
    
    
