import { IThreatTableRow } from "../interfaces/TableRowInterfaces";
import React, { useEffect, useRef, useState } from "react";

import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import { Box, TextField, Typography, IconButton } from "@mui/material";
import TableContainer from "@mui/material/TableContainer";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../utils/theme";
import AddCircleIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircleOutline";

export default function ThreatTables({ threatTables }: { threatTables: IThreatTableRow[][] }) {
    const [threatTable, setThreatTable] = useState<IThreatTableRow[][]>(threatTables);
    const lookupMapRef = useRef<Record<string, IThreatTableRow>>({});

    useEffect(() => {
        const generateLookupMap = (table: IThreatTableRow[][]) => {
            const map: Record<string, IThreatTableRow> = {};
            table.forEach((rows) => {
                rows.forEach(row => {
                    map[`${row.threatId}`] = row;
                });
            });
            return map;
        };
        lookupMapRef.current = generateLookupMap(threatTable);

    }, [threatTables]);

    const updateThreatTable = (threatId: string, field: string, value: string): void => {
        const newTable: IThreatTableRow[][] = [...threatTable];
        const key: string = threatId;
        if (lookupMapRef.current[key]) {
            switch (field) {
                case 'threat':
                    lookupMapRef.current[key].threat= value;
                    break;
                case 'mitigation':
                    lookupMapRef.current[key].mitigation= value;
                    break;
                case 'validation':
                    lookupMapRef.current[key].validation= value;
                    break;
                default:
                    break;
            }
        }
        setThreatTable(newTable);
        localStorage.setItem("ThreatTables", JSON.stringify(newTable));
    }

    const handleThreatChange = (threatId: string, value: string): void => {
        updateThreatTable(threatId, 'threat', value);
    };

    const handleMitigationChange = (threatId: string, value: string): void => {
        updateThreatTable(threatId, 'mitigation', value);
    };

    const handleValidationChange = (threatId: string, value: string): void => {
        updateThreatTable(threatId, 'validation', value);
    };

    const handleAddRow = (index: number, rowIndex: number) => {
        const currentRow : IThreatTableRow = threatTable[index][rowIndex];
        const baseId : string = currentRow.threatId;
        const existingRows : IThreatTableRow[] = threatTable[index];
        const subArray : IThreatTableRow[] = existingRows.filter(row => row.threatId.startsWith(baseId))
        const length : number = subArray.length

        let newIndex : number;
        if (length > 1) {
            const id : string = subArray[1].threatId;
            const parts : string[] = id.split('.');
            const numberAfterDot : number = parseFloat(parts[1]);
            newIndex = numberAfterDot + 1;
        } else {
            newIndex = 1;
        }

        const newThreatId : string = `${baseId}.${newIndex}`

        const newRow: IThreatTableRow = {
            type: "ThreatRow",
            threatId: newThreatId,
            dataflowEnumeration: currentRow.dataflowEnumeration,
            strideType: currentRow.strideType,
            threat: "",
            mitigation: "",
            validation: "",
            trustBoundaryId: currentRow.trustBoundaryId,
            trustBoundaryName: currentRow.trustBoundaryName,
            added: true
        };

        setThreatTable((prev) => {
            const newTable : IThreatTableRow[][] = [...prev];
            const insertionIndex : number = rowIndex + 1;
            newTable[index] = [
                ...newTable[index].slice(0, insertionIndex),
                newRow,
                ...newTable[index].slice(insertionIndex),
            ];
            return newTable;
        });
        lookupMapRef.current[newThreatId] = newRow;
    };


    const handleDeleteRow = (index: number, rowIndex: number) => {
        setThreatTable((prev) => {
            const newTable : IThreatTableRow[][] = [...prev];
            newTable[index] = newTable[index].filter((_, i) => i !== rowIndex);
            delete lookupMapRef.current[`${threatTable[index][rowIndex].threatId}`];
            return newTable;
        });
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ marginTop: '8px' }}>
                {threatTable.map((table: IThreatTableRow[], index: number) => (
                    <React.Fragment key={index}>
                        <Typography variant={"h5"}  sx={{marginTop: '8px'}}>{`Trust Boundary: ${table[index].trustBoundaryName}`}</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Threat ID</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Dataflow</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>STRIDE Type</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Threat</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Mitigation</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Validation</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {table.map((row : IThreatTableRow, rowIndex: number) => (
                                        <TableRow key={row.threatId}>
                                            <TableCell align="center">{row.threatId}</TableCell>
                                            <TableCell align="center">{row.dataflowEnumeration}</TableCell>
                                            <TableCell align="center">{row.strideType}</TableCell>
                                            <TableCell align="center">
                                                <TextField
                                                    size="small"
                                                    variant="outlined"
                                                    placeholder="Describe threat"
                                                    value={row.threat}
                                                    onChange={(event) => handleThreatChange(row.threatId, event.target.value)} />
                                            </TableCell>
                                            <TableCell align="center">
                                                <TextField
                                                    size="small"
                                                    variant="outlined"
                                                    placeholder="Provide mitigation"
                                                    value={row.mitigation}
                                                    onChange={(event) => handleMitigationChange(row.threatId, event.target.value)} />
                                            </TableCell>
                                            <TableCell align="center">
                                                <TextField
                                                    size="small"
                                                    variant="outlined"
                                                    placeholder="Provide validation"
                                                    value={row.validation}
                                                    onChange={(event) => handleValidationChange(row.threatId, event.target.value)} />
                                            </TableCell>
                                            <TableCell align="center">
                                                {!row.added ? (
                                                    <IconButton onClick={() => handleAddRow(index, rowIndex)}>
                                                        <AddCircleIcon />
                                                    </IconButton>
                                                ) : (
                                                    <IconButton onClick={() => handleDeleteRow(index, rowIndex)}>
                                                        <RemoveCircleIcon />
                                                    </IconButton>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </React.Fragment>
                ))}
            </Box>
        </ThemeProvider>
    );
}
