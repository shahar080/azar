import React, {useEffect, useRef} from 'react';
import {useDispatch} from 'react-redux';
import {useLocation, useNavigate} from 'react-router-dom';
import {getAuthToken} from "../../../shared/utils/AppState.ts";
import {secondsUntilExpiry} from "../../../shared/utils/jwt.ts";
import {logoutAndClear} from "../../../shared/store/authSlice.ts";

type Props = { children: React.ReactElement; redirectPath: string };

const ProtectedRoute: React.FC<Props> = ({ children, redirectPath }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const timerRef = useRef<number | null>(null);

    const token = getAuthToken();
    const secsLeft = secondsUntilExpiry(token);
    const isInvalid = !token || (secsLeft !== null && secsLeft <= 0);

    useEffect(() => {
        if (isInvalid) {
            logoutAndClear();
            navigate(redirectPath, { replace: true, state: { from: location } });
        }
    }, [isInvalid, dispatch, navigate, redirectPath, location]);

    useEffect(() => {
        if (timerRef.current) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        if (!isInvalid && secsLeft !== null) {
            const ms = Math.max(0, secsLeft * 1000);
            timerRef.current = window.setTimeout(() => {
                logoutAndClear();
                navigate(redirectPath, { replace: true, state: { from: location } });
            }, ms);
        }

        return () => {
            if (timerRef.current) {
                window.clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isInvalid, secsLeft, dispatch, navigate, redirectPath, location]);

    return !isInvalid ? children : null;
};

export default ProtectedRoute;
