import React from "react";
import {getUserId, setDrawerPinnedState} from "../../shared/utils/AppState.ts";
import {DRAWER_PIN_STR} from "../utils/constants.ts";
import {updatePreference} from "../server/api/preferencesApi.ts";
import {AlertColor} from "@mui/material";
import {parseSize} from "../utils/utilities.ts";

export const toggleDrawer = (drawerPinned: boolean,
                             setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>,
                             drawerOpen: boolean) => {
    if (!drawerPinned) {
        setDrawerOpen(!drawerOpen);
    }
};


export const pinDrawer = (setDrawerPinned: React.Dispatch<React.SetStateAction<boolean>>,
                          setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>,
                          userName: string,
                          showToast: (message: string, severity: AlertColor) => void) => {
    setDrawerPinned((prevPinned) => {
        setDrawerOpen(!prevPinned);
        const updatedPreference = {
            userId: Number(getUserId()),
            key: DRAWER_PIN_STR,
            value: (!prevPinned).toString()
        }
        updatePreference({preference: updatedPreference, currentUser: userName})
            .then(updatedPreference => {
                if (updatedPreference) {
                    setDrawerPinnedState(JSON.parse(updatedPreference.value));
                    setDrawerPinned(JSON.parse(updatedPreference.value));
                    setDrawerOpen(JSON.parse(updatedPreference.value));
                } else {
                    showToast("Error updating preference drawer pinned", "error")
                }
            })
        return !prevPinned;
    });
};


export const handleRequestSort = (property: string,
                                  orderBy: string,
                                  order: "desc" | "asc",
                                  setOrder: React.Dispatch<React.SetStateAction<"desc" | "asc">>,
                                  setOrderBy: React.Dispatch<React.SetStateAction<string>>) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
};

export const sortData = (array: any[],
                         order: "desc" | "asc",
                         orderBy: string,
                         sizeSupported: boolean = false) => {
    return array.sort((a, b) => {
        const isAsc = order === 'asc';
        if (sizeSupported) {
            if (orderBy === 'size') {
                const sizeA = parseSize(a.size);
                const sizeB = parseSize(b.size);
                return isAsc ? sizeA - sizeB : sizeB - sizeA;
            }
        }
        if (a[orderBy] < b[orderBy]) {
            return isAsc ? -1 : 1;
        }
        if (a[orderBy] > b[orderBy]) {
            return isAsc ? 1 : -1;
        }
        return 0;
    });
};
