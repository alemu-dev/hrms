<!DOCTYPE html>

<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: DejaVu Sans; }
        .header { text-align: center; font-weight: bold; }
        .content { margin-top: 30px; line-height: 1.6; }
        .footer { margin-top: 50px; }
    </style>
</head>
<body>

<div class="header">
    <h2>የሰራተኛ እድገት ደብዳቤ</h2>
    <h3>EMPLOYEE PROMOTION LETTER</h3>
</div>

<div class="content">
    <p>ቀን: {{ $movement->effective_date }}</p>

```
<p>
    ለ: {{ $movement->employee->first_name }} {{ $movement->employee->last_name }}
</p>

<p>
    እኛ በዚህ ደብዳቤ እንገልጻለን እንደሆነ፣
    እርስዎ ከ <strong>{{ $movement->old_position }}</strong>
    ወደ <strong>{{ $movement->new_position }}</strong>
    ተሻሽለዋል።
</p>

<p>
    አዲሱ ደመወዝ: {{ $movement->new_salary }} ETB
</p>

<p>
    This is to officially inform you that you have been promoted
    from <strong>{{ $movement->old_position }}</strong>
    to <strong>{{ $movement->new_position }}</strong>.
</p>

<p>
    Your new salary will be {{ $movement->new_salary }} ETB.
</p>
```

</div>

<div class="footer">
    <p>__________________________</p>
    <p>HR Manager</p>
</div>

</body>
</html>
